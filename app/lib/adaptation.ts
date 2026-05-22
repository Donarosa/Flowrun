import { createClient } from '@/lib/supabase/server'
import { runGateIfNeeded } from '@/lib/gate'
import type { AdaptationLogRow, SessionStatus } from '@/types/database'

// ============================================================================
// Motor de adaptación semanal (versión mínima, sin gate criteria).
// Se dispara al completar la última sesión pendiente de una semana.
// Evalúa métricas de esa semana y aplica una regla sobre la semana siguiente.
// ============================================================================

type Rule =
  | 'fatigue_high'
  | 'sustainable_progression'
  | 'low_adherence'
  | 'maintain'

type RuleOutput = {
  rule: Rule
  modifier: number | null // 0.90, 1.05, etc. null = no modifica volumen
  removeOneSession: boolean
  message_es: string
  noteForSession: string | null
}

type WeekMetrics = {
  totalSessions: number
  completedSessions: number
  avgRpe: number | null
  sustainableRatio: number // % de sesiones EASY (rpe<=2 + talk=phrases)
  anyPain: boolean
}

// Punto de entrada: lo llaman markSessionDone y saveCheckin.
// Detecta qué semana acaba de cerrarse y, si era la última pending de esa
// semana, dispara la adaptación para la siguiente. Idempotente vía
// adaptation_logs.unique(user_plan_id, week_number).
export async function runWeeklyAdaptationIfNeeded(userSessionId: string) {
  const supabase = await createClient()

  // Si la sesión cierra un bloque con gate (e.g. desde_cero_3d), el gate
  // engine se ocupa: registra su propio log y absorbe el slot de la semana.
  const gateRan = await runGateIfNeeded(userSessionId)
  if (gateRan) return

  // Resolver user_plan + week de la sesión que se acaba de completar.
  type Row = {
    user_plan_id: string
    template_session:
      | { week_number: number }
      | { week_number: number }[]
      | null
  }
  const { data: row } = await supabase
    .from('user_sessions')
    .select(
      `
      user_plan_id,
      template_session:template_sessions ( week_number )
    `
    )
    .eq('id', userSessionId)
    .maybeSingle<Row>()
  if (!row) return
  const tmpl = Array.isArray(row.template_session)
    ? row.template_session[0]
    : row.template_session
  if (!tmpl) return
  const weekNumber = tmpl.week_number
  const userPlanId = row.user_plan_id

  // ¿Quedan sesiones pendientes de esa semana?
  const { data: pending } = await supabase
    .from('user_sessions')
    .select('id, status, template_session:template_sessions ( week_number )')
    .eq('user_plan_id', userPlanId)
    .eq('status', 'pending')
  const stillPending = (pending ?? []).some((s) => {
    const t = Array.isArray(s.template_session)
      ? s.template_session[0]
      : s.template_session
    return t?.week_number === weekNumber
  })
  if (stillPending) return

  // ¿Ya corrimos adaptación para esta semana?
  const { data: existingLog } = await supabase
    .from('adaptation_logs')
    .select('id')
    .eq('user_plan_id', userPlanId)
    .eq('week_number', weekNumber)
    .maybeSingle()
  if (existingLog) return

  // Calcular métricas y elegir regla.
  const metrics = await computeWeekMetrics(userPlanId, weekNumber)
  const decision = pickRule(metrics)

  // Aplicar a sesiones de la semana siguiente.
  const sessionsModified = await applyDecisionToNextWeek({
    userPlanId,
    nextWeek: weekNumber + 1,
    decision,
  })

  // Loguear.
  await supabase.from('adaptation_logs').insert({
    user_plan_id: userPlanId,
    week_number: weekNumber,
    rule_triggered: decision.rule,
    modifier_applied: decision.modifier,
    sessions_modified: sessionsModified,
    message_es: decision.message_es,
  })
}

async function computeWeekMetrics(
  userPlanId: string,
  weekNumber: number
): Promise<WeekMetrics> {
  const supabase = await createClient()

  type SessionRow = {
    id: string
    status: SessionStatus
    template_session:
      | { week_number: number }
      | { week_number: number }[]
      | null
    checkin:
      | {
          rpe: number
          talk_test: string
          pain: boolean
        }
      | {
          rpe: number
          talk_test: string
          pain: boolean
        }[]
      | null
  }

  const { data: rows } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      status,
      template_session:template_sessions ( week_number ),
      checkin:session_checkins ( rpe, talk_test, pain )
    `
    )
    .eq('user_plan_id', userPlanId)
    .returns<SessionRow[]>()

  const inWeek = (rows ?? []).filter((r) => {
    const t = Array.isArray(r.template_session)
      ? r.template_session[0]
      : r.template_session
    return t?.week_number === weekNumber
  })

  const total = inWeek.length
  const completed = inWeek.filter((r) => r.status === 'completed').length

  const checkins = inWeek
    .map((r) => (Array.isArray(r.checkin) ? r.checkin[0] : r.checkin))
    .filter((c): c is NonNullable<typeof c> => c !== null)

  const rpes = checkins.map((c) => c.rpe)
  const avgRpe = rpes.length
    ? rpes.reduce((a, b) => a + b, 0) / rpes.length
    : null
  const sustainable = checkins.filter(
    (c) => c.rpe <= 2 && c.talk_test === 'phrases'
  ).length
  const sustainableRatio = checkins.length ? sustainable / checkins.length : 0
  const anyPain = checkins.some((c) => c.pain)

  return {
    totalSessions: total,
    completedSessions: completed,
    avgRpe,
    sustainableRatio,
    anyPain,
  }
}

function pickRule(m: WeekMetrics): RuleOutput {
  // Sin check-ins suficientes → mantener (no podemos decidir bien).
  if (m.avgRpe === null) {
    return {
      rule: 'maintain',
      modifier: null,
      removeOneSession: false,
      message_es:
        'Semana sin check-ins suficientes para ajustar. Seguimos como estaba.',
      noteForSession: null,
    }
  }

  // R1: fatiga / dolor → reducir 10%.
  if (m.anyPain || m.avgRpe >= 4) {
    return {
      rule: 'fatigue_high',
      modifier: 0.9,
      removeOneSession: false,
      message_es: m.anyPain
        ? 'Detectamos molestia esta semana. Bajamos un poco el volumen para que tu cuerpo se recupere.'
        : 'Tu cuerpo está acumulando carga. Bajamos un 10% para que sigas progresando sin riesgo.',
      noteForSession: 'Ajustada · -10% por fatiga',
    }
  }

  // R3: progresión positiva → +5%.
  if (m.sustainableRatio >= 0.7 && m.avgRpe <= 2.5) {
    return {
      rule: 'sustainable_progression',
      modifier: 1.05,
      removeOneSession: false,
      message_es:
        'Tu cuerpo se está adaptando bien. Subimos un poco el volumen esta semana.',
      noteForSession: 'Ajustada · +5% por progresión',
    }
  }

  // R4: baja adherencia → eliminar una sesión.
  const adherence =
    m.totalSessions > 0 ? m.completedSessions / m.totalSessions : 0
  if (adherence < 0.5) {
    return {
      rule: 'low_adherence',
      modifier: null,
      removeOneSession: true,
      message_es:
        'Ajustamos tu plan para que vuelva a sentirse sostenible. Saltamos una sesión esta semana.',
      noteForSession: 'Saltada · plan más liviano esta semana',
    }
  }

  // R2: mantener.
  return {
    rule: 'maintain',
    modifier: null,
    removeOneSession: false,
    message_es: 'Semana equilibrada. Seguimos construyendo base.',
    noteForSession: null,
  }
}

async function applyDecisionToNextWeek({
  userPlanId,
  nextWeek,
  decision,
}: {
  userPlanId: string
  nextWeek: number
  decision: RuleOutput
}): Promise<number> {
  const supabase = await createClient()

  type SessionRow = {
    id: string
    template_session:
      | { week_number: number; day_index: number }
      | { week_number: number; day_index: number }[]
      | null
  }
  const { data: rows } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      template_session:template_sessions ( week_number, day_index )
    `
    )
    .eq('user_plan_id', userPlanId)
    .eq('status', 'pending')
    .returns<SessionRow[]>()

  const inWeek = (rows ?? [])
    .map((r) => {
      const t = Array.isArray(r.template_session)
        ? r.template_session[0]
        : r.template_session
      return t?.week_number === nextWeek
        ? { id: r.id, day_index: t.day_index }
        : null
    })
    .filter((r): r is { id: string; day_index: number } => r !== null)

  if (inWeek.length === 0) return 0

  // R1/R3: aplicar duration_modifier a todas las sesiones de la semana.
  if (decision.modifier !== null) {
    const ids = inWeek.map((r) => r.id)
    const { error } = await supabase
      .from('user_sessions')
      .update({
        duration_modifier: decision.modifier,
        adaptation_note: decision.noteForSession,
      })
      .in('id', ids)
    if (error) throw new Error(error.message)
    return ids.length
  }

  // R4: marcar la sesión del día_index más alto como skipped.
  if (decision.removeOneSession) {
    const lastDay = inWeek.reduce((acc, r) =>
      r.day_index > acc.day_index ? r : acc
    )
    const { error } = await supabase
      .from('user_sessions')
      .update({
        status: 'skipped',
        adaptation_note: decision.noteForSession,
      })
      .eq('id', lastDay.id)
    if (error) throw new Error(error.message)
    return 1
  }

  // R2 (maintain): nada que cambiar.
  return 0
}

// Última adaptación del plan activo del usuario (para el banner del coach).
export async function getLatestAdaptation(
  userId: string
): Promise<AdaptationLogRow | null> {
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('user_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  if (!plan) return null

  const { data: log } = await supabase
    .from('adaptation_logs')
    .select('*')
    .eq('user_plan_id', plan.id)
    .order('week_number', { ascending: false })
    .limit(1)
    .maybeSingle<AdaptationLogRow>()

  return log
}
