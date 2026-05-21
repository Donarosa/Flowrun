import { createClient } from '@/lib/supabase/server'
import type {
  SessionBlock,
  SessionStatus,
  WorkoutBlock,
} from '@/types/database'

// Offset de días dentro de cada semana, según frecuencia.
// Indexado por day_index del template (1, 2, 3, 4).
const DAY_OFFSETS: Record<number, number[]> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// Mapeo perfil → template. Devolverá null cuando todavía no haya plan para ese nivel
// (e.g. advanced). El frontend muestra "tu plan está en camino".
function pickTemplateCode(
  experienceLevel: 'new' | 'base' | 'advanced'
): string | null {
  switch (experienceLevel) {
    case 'new':
      return 'desde_cero_3d'
    case 'base':
      return 'nuevo_calle_3d'
    case 'advanced':
      return null
  }
}

// Asigna un plan al usuario y materializa las user_sessions con fechas reales.
// Idempotente: si ya tiene un plan activo, no hace nada.
// Retorna el id del plan activo, o null si no se pudo asignar (e.g. advanced sin plan).
export async function assignPlan(userId: string): Promise<string | null> {
  const supabase = await createClient()

  // 1. Ya tiene plan activo?
  const { data: existing } = await supabase
    .from('user_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  if (existing) return existing.id

  // 2. Cargar perfil para matching.
  const { data: profile } = await supabase
    .from('profiles')
    .select('experience_level, goal_type, weekly_days')
    .eq('id', userId)
    .single()
  if (
    !profile ||
    !profile.experience_level ||
    !profile.goal_type ||
    !profile.weekly_days
  ) {
    return null
  }

  // 3. Mapping de perfil → template. Por ahora solo dependemos de experience_level
  //    (goal_type se ramificará cuando seedeemos más planes: calle_trail, trail).
  //    advanced → null (planes pro vienen después).
  const templateCode = pickTemplateCode(profile.experience_level)
  if (!templateCode) return null

  const { data: template } = await supabase
    .from('plan_templates')
    .select('id')
    .eq('code', templateCode)
    .single()
  if (!template) throw new Error(`Template ${templateCode} no encontrado`)

  // 4. Crear user_plan.
  const startedOn = todayIso()
  const { data: plan, error: planError } = await supabase
    .from('user_plans')
    .insert({
      user_id: userId,
      template_id: template.id,
      started_on: startedOn,
      status: 'active',
    })
    .select('id')
    .single()
  if (planError || !plan) {
    throw new Error(planError?.message ?? 'No se pudo crear user_plan')
  }

  // 5. Cargar las sesiones del template.
  const { data: tmplSessions } = await supabase
    .from('template_sessions')
    .select('id, week_number, day_index')
    .eq('template_id', template.id)
    .order('week_number', { ascending: true })
    .order('day_index', { ascending: true })
  if (!tmplSessions || tmplSessions.length === 0) {
    throw new Error('No hay template_sessions para nuevo_calle_3d')
  }

  // 6. Materializar user_sessions con scheduled_date.
  const offsets = DAY_OFFSETS[profile.weekly_days] ?? DAY_OFFSETS[3]
  const userSessions = tmplSessions.map((s) => {
    const offsetInWeek = offsets[s.day_index - 1] ?? 0
    const totalOffset = (s.week_number - 1) * 7 + offsetInWeek
    return {
      user_plan_id: plan.id,
      template_session_id: s.id,
      scheduled_date: addDays(startedOn, totalOffset),
      status: 'pending' as SessionStatus,
    }
  })

  const { error: sessionsError } = await supabase
    .from('user_sessions')
    .insert(userSessions)
  if (sessionsError) throw new Error(sessionsError.message)

  return plan.id
}

// Sesión del día actual, con datos del template y bloques resueltos a nombres.
// Retorna null si no hay sesión hoy (día de descanso) o no hay plan.
export type ResolvedBlock = {
  code: string
  name: string
  durationMin: number
  note?: string
}

export type TodaySession = {
  userSessionId: string
  status: SessionStatus
  scheduledDate: string
  name: string
  isDeload: boolean
  weekNumber: number
  totalDurationMin: number
  blocks: ResolvedBlock[]
}

export type PlanSessionSummary = {
  userSessionId: string
  status: SessionStatus
  scheduledDate: string
  sessionName: string
  totalDurationMin: number
  isDeload: boolean
  blockCodes: string[]
  isToday: boolean
  isPast: boolean
}

export type PlanWeek = {
  weekNumber: number
  hasDeload: boolean
  sessions: PlanSessionSummary[]
}

export type PlanOverview = {
  templateCode: string
  templateName: string
  totalWeeks: number
  startedOn: string
  weeks: PlanWeek[]
}

export async function getTodaySession(
  userId: string
): Promise<TodaySession | null> {
  const supabase = await createClient()
  const today = todayIso()

  const { data: plan } = await supabase
    .from('user_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  if (!plan) return null

  type SessionRow = {
    id: string
    status: SessionStatus
    scheduled_date: string
    template_session:
      | {
          session_name: string
          blocks: SessionBlock[]
          total_duration_min: number
          is_deload: boolean
          week_number: number
        }
      | {
          session_name: string
          blocks: SessionBlock[]
          total_duration_min: number
          is_deload: boolean
          week_number: number
        }[]
      | null
  }

  const { data: rawSession } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      status,
      scheduled_date,
      template_session:template_sessions (
        session_name,
        blocks,
        total_duration_min,
        is_deload,
        week_number
      )
    `
    )
    .eq('user_plan_id', plan.id)
    .eq('scheduled_date', today)
    .maybeSingle<SessionRow>()
  if (!rawSession || !rawSession.template_session) return null

  const tmpl = Array.isArray(rawSession.template_session)
    ? rawSession.template_session[0]
    : rawSession.template_session
  if (!tmpl) return null

  // Resolver code → name de los bloques.
  const codes = tmpl.blocks.map((b) => b.code)
  const { data: blockRows } = await supabase
    .from('workout_blocks')
    .select('code, name')
    .in('code', codes)
  const nameByCode = new Map<string, string>(
    (blockRows ?? []).map((b: Pick<WorkoutBlock, 'code' | 'name'>) => [
      b.code,
      b.name,
    ])
  )

  return {
    userSessionId: rawSession.id,
    status: rawSession.status,
    scheduledDate: rawSession.scheduled_date,
    name: tmpl.session_name,
    isDeload: tmpl.is_deload,
    weekNumber: tmpl.week_number,
    totalDurationMin: tmpl.total_duration_min,
    blocks: tmpl.blocks.map((b) => ({
      code: b.code,
      name: nameByCode.get(b.code) ?? b.code,
      durationMin: b.duration_min,
      note: b.note,
    })),
  }
}

// Plan completo agrupado por semana, para la pantalla /plan.
export async function getPlanOverview(
  userId: string
): Promise<PlanOverview | null> {
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('user_plans')
    .select(
      `
      id,
      started_on,
      template:plan_templates ( code, name, total_weeks )
    `
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle<{
      id: string
      started_on: string
      template:
        | { code: string; name: string; total_weeks: number }
        | { code: string; name: string; total_weeks: number }[]
        | null
    }>()
  if (!plan || !plan.template) return null

  const template = Array.isArray(plan.template) ? plan.template[0] : plan.template
  if (!template) return null

  type Row = {
    id: string
    status: SessionStatus
    scheduled_date: string
    template_session:
      | {
          session_name: string
          blocks: SessionBlock[]
          total_duration_min: number
          is_deload: boolean
          week_number: number
        }
      | {
          session_name: string
          blocks: SessionBlock[]
          total_duration_min: number
          is_deload: boolean
          week_number: number
        }[]
      | null
  }

  const { data: rows } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      status,
      scheduled_date,
      template_session:template_sessions (
        session_name,
        blocks,
        total_duration_min,
        is_deload,
        week_number
      )
    `
    )
    .eq('user_plan_id', plan.id)
    .order('scheduled_date', { ascending: true })
    .returns<Row[]>()

  const today = todayIso()
  const sessions: (PlanSessionSummary & { weekNumber: number })[] = (
    rows ?? []
  )
    .map((r) => {
      const t = Array.isArray(r.template_session)
        ? r.template_session[0]
        : r.template_session
      if (!t) return null
      return {
        weekNumber: t.week_number,
        userSessionId: r.id,
        status: r.status,
        scheduledDate: r.scheduled_date,
        sessionName: t.session_name,
        totalDurationMin: t.total_duration_min,
        isDeload: t.is_deload,
        blockCodes: t.blocks.map((b) => b.code),
        isToday: r.scheduled_date === today,
        isPast: r.scheduled_date < today,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  // Agrupar por week_number.
  const byWeek = new Map<number, PlanSessionSummary[]>()
  for (const s of sessions) {
    const { weekNumber, ...summary } = s
    const arr = byWeek.get(weekNumber) ?? []
    arr.push(summary)
    byWeek.set(weekNumber, arr)
  }

  const weeks: PlanWeek[] = Array.from(byWeek.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekNumber, sess]) => ({
      weekNumber,
      hasDeload: sess.some((s) => s.isDeload),
      sessions: sess,
    }))

  return {
    templateCode: template.code,
    templateName: template.name,
    totalWeeks: template.total_weeks,
    startedOn: plan.started_on,
    weeks,
  }
}
