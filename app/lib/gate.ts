import { createClient } from '@/lib/supabase/server'
import type { SessionStatus } from '@/types/database'

// ============================================================================
// Gate criteria + graduación. Reemplaza la regla regular de adaptation en las
// semanas configuradas para cada plan (BlockDefinition.triggerWeek). Evalúa
// adherencia + RPE + dolor sobre el rango weeks del bloque.
//
// Patrón para planes 8 semanas con deload sem 4 y sem 8:
//   - Bloque intermedio 1: weeks [1,3] → trigger 3, modifier al bloque [5,7]
//   - Bloque intermedio 2: weeks [5,7] → trigger 7, modifier al bloque [8,8]
//   - Final:              weeks [1,8] → trigger 8, isFinal=true
//
// Patrón especial de desde_cero_3d (run-walk con 4 bloques de 2 sem cada uno):
//   - A: [1,2] → trigger 2, next [3,4]
//   - B: [3,4] → trigger 4, next [5,6]
//   - C: [5,6] → trigger 6, next [7,8]
//   - D: [7,8] → trigger 8, isFinal=true
// ============================================================================

type BlockDefinition = {
  label: string
  weeks: [number, number]
  nextBlockWeeks: [number, number] | null // null cuando el "ajuste por failed" no aplica
  triggerWeek?: number // semana en la que dispara el gate (default = weeks[1])
  isFinal?: boolean // si pasa el gate y hay target → graduation_ready
}

function triggerWeekOf(b: BlockDefinition): number {
  return b.triggerWeek ?? b.weeks[1]
}

const PLAN_GATE_DEFINITIONS: Record<string, BlockDefinition[]> = {
  desde_cero_3d: [
    { label: 'A', weeks: [1, 2], nextBlockWeeks: [3, 4] },
    { label: 'B', weeks: [3, 4], nextBlockWeeks: [5, 6] },
    { label: 'C', weeks: [5, 6], nextBlockWeeks: [7, 8] },
    { label: 'D', weeks: [7, 8], nextBlockWeeks: null, isFinal: true },
  ],
  nuevo_calletrail_3d: [
    { label: 'Construcción', weeks: [1, 3], nextBlockWeeks: [5, 7] },
    { label: 'Carga', weeks: [5, 7], nextBlockWeeks: [8, 8] },
    { label: 'Final', weeks: [1, 8], nextBlockWeeks: null, triggerWeek: 8, isFinal: true },
  ],
  nuevo_calle_3d: [
    { label: 'Construcción', weeks: [1, 3], nextBlockWeeks: [5, 7] },
    { label: 'Carga', weeks: [5, 7], nextBlockWeeks: [8, 8] },
    { label: 'Final', weeks: [1, 8], nextBlockWeeks: null, triggerWeek: 8, isFinal: true },
  ],
  calle_trail_base_3d: [
    { label: 'Construcción', weeks: [1, 3], nextBlockWeeks: [5, 7] },
    { label: 'Carga', weeks: [5, 7], nextBlockWeeks: [8, 8] },
    { label: 'Final', weeks: [1, 8], nextBlockWeeks: null, triggerWeek: 8, isFinal: true },
  ],
  nuevo_montana_3d: [
    { label: 'Construcción', weeks: [1, 3], nextBlockWeeks: [5, 7] },
    { label: 'Carga', weeks: [5, 7], nextBlockWeeks: [8, 8] },
    { label: 'Final', weeks: [1, 8], nextBlockWeeks: null, triggerWeek: 8, isFinal: true },
  ],
  calle_trail_avanzado_4d: [
    { label: 'Construcción', weeks: [1, 3], nextBlockWeeks: [5, 7] },
    { label: 'Carga', weeks: [5, 7], nextBlockWeeks: [8, 8] },
    { label: 'Final', weeks: [1, 8], nextBlockWeeks: null, triggerWeek: 8, isFinal: true },
  ],
  // Planes pro Sarah McCormack. Race prep: gates en el cierre de la fase
  // base y pre-taper, plus chequeo final en race week.
  trail_10k: [
    { label: 'Base', weeks: [1, 4], nextBlockWeeks: [5, 9] },
    { label: 'Pre-taper', weeks: [5, 9], nextBlockWeeks: [10, 10], triggerWeek: 9 },
    { label: 'Race week', weeks: [1, 10], nextBlockWeeks: null, triggerWeek: 10, isFinal: true },
  ],
  trail_half: [
    { label: 'Base', weeks: [1, 4], nextBlockWeeks: [5, 9] },
    { label: 'Pre-taper', weeks: [5, 9], nextBlockWeeks: [10, 10], triggerWeek: 9 },
    { label: 'Race week', weeks: [1, 10], nextBlockWeeks: null, triggerWeek: 10, isFinal: true },
  ],
  trail_marathon: [
    { label: 'Base', weeks: [1, 5], nextBlockWeeks: [6, 11] },
    { label: 'Pico', weeks: [6, 11], nextBlockWeeks: [12, 15], triggerWeek: 11 },
    { label: 'Pre-taper', weeks: [12, 15], nextBlockWeeks: [16, 16], triggerWeek: 15 },
    { label: 'Race week', weeks: [1, 16], nextBlockWeeks: null, triggerWeek: 16, isFinal: true },
  ],
  '50_mile_beginner': [
    { label: 'Base', weeks: [1, 5], nextBlockWeeks: [6, 11] },
    { label: 'Volumen', weeks: [6, 11], nextBlockWeeks: [12, 15], triggerWeek: 11 },
    { label: 'Pre-taper', weeks: [12, 15], nextBlockWeeks: [16, 16], triggerWeek: 15 },
    { label: 'Race week', weeks: [1, 16], nextBlockWeeks: null, triggerWeek: 16, isFinal: true },
  ],
  '100k': [
    { label: 'Base', weeks: [1, 5], nextBlockWeeks: [6, 11] },
    { label: 'Volumen', weeks: [6, 11], nextBlockWeeks: [12, 15], triggerWeek: 11 },
    { label: 'Pre-taper', weeks: [12, 15], nextBlockWeeks: [16, 16], triggerWeek: 15 },
    { label: 'Race week', weeks: [1, 16], nextBlockWeeks: null, triggerWeek: 16, isFinal: true },
  ],
}

const GATE_AVG_RPE_MAX = 4
const GATE_ADHERENCE_MIN = 0.7
const FAILED_MODIFIER = 0.9 // -10% al bloque siguiente cuando el gate falla

// Mapping de "qué plan viene después" por goal_type. Si no hay entrada, el
// plan es tope (no hay siguiente) y el gate final loguea `plan_completed`.
const GRADUATION_TARGET: Record<string, Record<string, string>> = {
  desde_cero_3d: {
    calle: 'nuevo_calle_3d',
    calle_trail: 'calle_trail_base_3d',
    trail: 'nuevo_montana_3d',
  },
  nuevo_calletrail_3d: {
    calle_trail: 'calle_trail_base_3d',
    trail: 'nuevo_montana_3d',
  },
  nuevo_calle_3d: {
    calle_trail: 'calle_trail_base_3d',
  },
  calle_trail_base_3d: {
    calle_trail: 'calle_trail_avanzado_4d',
    trail: 'calle_trail_avanzado_4d',
  },
  nuevo_montana_3d: {
    trail: 'calle_trail_avanzado_4d',
    calle_trail: 'calle_trail_avanzado_4d',
  },
  // calle_trail_avanzado_4d: tope, sin target
}

function targetFor(templateCode: string, goal: string | null): string | null {
  if (!goal) return null
  return GRADUATION_TARGET[templateCode]?.[goal] ?? null
}

export type GateRule =
  | 'gate_passed'
  | 'gate_failed'
  | 'graduation_ready'
  | 'graduation_pending'
  | 'plan_completed'

type BlockMetrics = {
  totalSessions: number
  completedSessions: number
  avgRpe: number | null
  anyPain: boolean
}

// Plan code de la user_session que se acaba de completar.
// Si no es un plan con gate, retorna null y el caller cae al adaptation regular.
export async function getGateBlockForSession(
  userSessionId: string
): Promise<{
  userPlanId: string
  templateCode: string
  goalType: string | null
  block: BlockDefinition
  weekJustClosed: number
} | null> {
  const supabase = await createClient()

  type Row = {
    user_plan_id: string
    template_session:
      | { week_number: number }
      | { week_number: number }[]
      | null
    user_plan:
      | {
          template: { code: string } | { code: string }[] | null
          user_id: string
        }
      | {
          template: { code: string } | { code: string }[] | null
          user_id: string
        }[]
      | null
  }

  const { data: row } = await supabase
    .from('user_sessions')
    .select(
      `
      user_plan_id,
      template_session:template_sessions ( week_number ),
      user_plan:user_plans (
        user_id,
        template:plan_templates ( code )
      )
    `
    )
    .eq('id', userSessionId)
    .maybeSingle<Row>()
  if (!row) return null

  const tmpl = Array.isArray(row.template_session)
    ? row.template_session[0]
    : row.template_session
  const plan = Array.isArray(row.user_plan) ? row.user_plan[0] : row.user_plan
  if (!tmpl || !plan) return null

  const template = Array.isArray(plan.template) ? plan.template[0] : plan.template
  if (!template) return null

  const blocks = PLAN_GATE_DEFINITIONS[template.code]
  if (!blocks) return null

  const week = tmpl.week_number
  const block = blocks.find((b) => triggerWeekOf(b) === week)
  if (!block) return null

  // Cargar goal_type del usuario para la graduación.
  const { data: profile } = await supabase
    .from('profiles')
    .select('goal_type')
    .eq('id', plan.user_id)
    .maybeSingle<{ goal_type: string | null }>()

  return {
    userPlanId: row.user_plan_id,
    templateCode: template.code,
    goalType: profile?.goal_type ?? null,
    block,
    weekJustClosed: week,
  }
}

// Ejecuta el gate engine si la sesión completada cierra un bloque del plan.
// Retorna true si corrió y absorbió la decisión de la semana
// (en ese caso el adaptation regular NO debe correr para esa semana).
export async function runGateIfNeeded(userSessionId: string): Promise<boolean> {
  const context = await getGateBlockForSession(userSessionId)
  if (!context) return false

  const supabase = await createClient()

  // Solo dispara si TODAS las sesiones del bloque están cerradas
  // (completed o skipped). Si quedan pending, salir.
  const stillPending = await blockHasPendingSessions(
    context.userPlanId,
    context.block.weeks
  )
  if (stillPending) return false

  // Idempotencia: ya hay log para esta semana del plan?
  const { data: existing } = await supabase
    .from('adaptation_logs')
    .select('id')
    .eq('user_plan_id', context.userPlanId)
    .eq('week_number', context.weekJustClosed)
    .maybeSingle()
  if (existing) return true // Ya corrió. El gate "ganó" el slot de esta semana.

  const metrics = await computeBlockMetrics(context.userPlanId, context.block.weeks)
  const hasGraduationTarget = !!targetFor(context.templateCode, context.goalType)
  const decision = decideGate(metrics, context.block, hasGraduationTarget)

  let sessionsModified = 0
  if (decision.rule === 'gate_failed' && context.block.nextBlockWeeks) {
    sessionsModified = await applyFailedModifierToNextBlock(
      context.userPlanId,
      context.block.nextBlockWeeks
    )
  }

  await supabase.from('adaptation_logs').insert({
    user_plan_id: context.userPlanId,
    week_number: context.weekJustClosed,
    rule_triggered: decision.rule,
    modifier_applied: decision.rule === 'gate_failed' ? FAILED_MODIFIER : null,
    sessions_modified: sessionsModified,
    message_es: decision.message_es,
  })

  return true
}

async function blockHasPendingSessions(
  userPlanId: string,
  weeks: [number, number]
): Promise<boolean> {
  const supabase = await createClient()
  type Row = {
    status: SessionStatus
    template_session:
      | { week_number: number }
      | { week_number: number }[]
      | null
  }
  const { data: rows } = await supabase
    .from('user_sessions')
    .select('status, template_session:template_sessions ( week_number )')
    .eq('user_plan_id', userPlanId)
    .eq('status', 'pending')
    .returns<Row[]>()

  return (rows ?? []).some((r) => {
    const t = Array.isArray(r.template_session)
      ? r.template_session[0]
      : r.template_session
    return t && t.week_number >= weeks[0] && t.week_number <= weeks[1]
  })
}

async function computeBlockMetrics(
  userPlanId: string,
  weeks: [number, number]
): Promise<BlockMetrics> {
  const supabase = await createClient()

  type Row = {
    status: SessionStatus
    template_session:
      | { week_number: number }
      | { week_number: number }[]
      | null
    checkin:
      | { rpe: number; pain: boolean }
      | { rpe: number; pain: boolean }[]
      | null
  }
  const { data: rows } = await supabase
    .from('user_sessions')
    .select(
      `
      status,
      template_session:template_sessions ( week_number ),
      checkin:session_checkins ( rpe, pain )
    `
    )
    .eq('user_plan_id', userPlanId)
    .returns<Row[]>()

  const inBlock = (rows ?? []).filter((r) => {
    const t = Array.isArray(r.template_session)
      ? r.template_session[0]
      : r.template_session
    return t && t.week_number >= weeks[0] && t.week_number <= weeks[1]
  })

  const total = inBlock.length
  const completed = inBlock.filter((r) => r.status === 'completed').length

  const checkins = inBlock
    .map((r) => (Array.isArray(r.checkin) ? r.checkin[0] : r.checkin))
    .filter((c): c is NonNullable<typeof c> => c !== null)
  const rpes = checkins.map((c) => c.rpe)
  const avgRpe = rpes.length
    ? rpes.reduce((a, b) => a + b, 0) / rpes.length
    : null
  const anyPain = checkins.some((c) => c.pain)

  return {
    totalSessions: total,
    completedSessions: completed,
    avgRpe,
    anyPain,
  }
}

function decideGate(
  m: BlockMetrics,
  block: BlockDefinition,
  hasGraduationTarget: boolean
): { rule: GateRule; message_es: string } {
  const adherence =
    m.totalSessions > 0 ? m.completedSessions / m.totalSessions : 0
  const rpeOk = m.avgRpe === null ? true : m.avgRpe <= GATE_AVG_RPE_MAX
  const passed = rpeOk && !m.anyPain && adherence >= GATE_ADHERENCE_MIN

  const isFinal = block.isFinal === true

  if (passed && isFinal) {
    if (hasGraduationTarget) {
      return {
        rule: 'graduation_ready',
        message_es:
          'Cerraste el plan y tu cuerpo está respondiendo bien. Estás listo para pasar al próximo nivel.',
      }
    }
    return {
      rule: 'plan_completed',
      message_es:
        'Cerraste el plan completo con todas las luces verdes. Sos un crack — seguí construyendo desde acá.',
    }
  }
  if (!passed && isFinal) {
    return {
      rule: 'graduation_pending',
      message_es:
        'Cerraste el plan, pero tu cuerpo todavía pide más base. Sumamos una repetición liviana antes de graduarte.',
    }
  }
  if (passed) {
    return {
      rule: 'gate_passed',
      message_es: `Cerraste el bloque ${block.label} con buen registro. Pasamos al siguiente sin ajustes.`,
    }
  }
  // failed (no final)
  if (m.anyPain) {
    return {
      rule: 'gate_failed',
      message_es:
        'Detectamos molestia durante el bloque. Bajamos un 10% el próximo para que tu cuerpo se asiente.',
    }
  }
  if (adherence < GATE_ADHERENCE_MIN) {
    return {
      rule: 'gate_failed',
      message_es:
        'Esta etapa quedó incompleta. Suavizamos el próximo bloque para que vuelvas a engancharte.',
    }
  }
  return {
    rule: 'gate_failed',
    message_es:
      'El esfuerzo todavía está alto. Bajamos un 10% el próximo bloque para que la base se consolide.',
  }
}

async function applyFailedModifierToNextBlock(
  userPlanId: string,
  nextBlockWeeks: [number, number]
): Promise<number> {
  const supabase = await createClient()

  type Row = {
    id: string
    template_session:
      | { week_number: number }
      | { week_number: number }[]
      | null
  }
  const { data: rows } = await supabase
    .from('user_sessions')
    .select('id, template_session:template_sessions ( week_number )')
    .eq('user_plan_id', userPlanId)
    .eq('status', 'pending')
    .returns<Row[]>()

  const ids = (rows ?? [])
    .filter((r) => {
      const t = Array.isArray(r.template_session)
        ? r.template_session[0]
        : r.template_session
      return (
        t && t.week_number >= nextBlockWeeks[0] && t.week_number <= nextBlockWeeks[1]
      )
    })
    .map((r) => r.id)

  if (ids.length === 0) return 0

  const { error } = await supabase
    .from('user_sessions')
    .update({
      duration_modifier: FAILED_MODIFIER,
      adaptation_note: 'Ajustada · -10% por cierre de bloque',
    })
    .in('id', ids)
  if (error) throw new Error(error.message)
  return ids.length
}

// Última oferta de graduación pendiente del usuario (latest log con rule='graduation_ready'
// para el plan activo). Retorna null si no hay o si el plan ya no está activo.
export type GraduationOffer = {
  userPlanId: string
  fromTemplateCode: string
  targetTemplateCode: string
  message_es: string
}

export async function getPendingGraduation(
  userId: string
): Promise<GraduationOffer | null> {
  const supabase = await createClient()

  type PlanRow = {
    id: string
    template: { code: string } | { code: string }[] | null
  }
  const { data: plan } = await supabase
    .from('user_plans')
    .select(
      `
      id,
      template:plan_templates ( code )
    `
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle<PlanRow>()
  if (!plan) return null
  const template = Array.isArray(plan.template) ? plan.template[0] : plan.template
  if (!template) return null

  const { data: log } = await supabase
    .from('adaptation_logs')
    .select('rule_triggered, message_es')
    .eq('user_plan_id', plan.id)
    .eq('rule_triggered', 'graduation_ready')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ rule_triggered: string; message_es: string }>()
  if (!log) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('goal_type')
    .eq('id', userId)
    .maybeSingle<{ goal_type: string | null }>()

  const target = targetFor(template.code, profile?.goal_type ?? null)
  if (!target) return null

  return {
    userPlanId: plan.id,
    fromTemplateCode: template.code,
    targetTemplateCode: target,
    message_es: log.message_es,
  }
}
