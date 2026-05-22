import { createClient } from '@/lib/supabase/server'
import type {
  ExperienceLevel,
  GoalType,
  SessionBlock,
  SessionStatus,
  WorkoutBlock,
} from '@/types/database'

// Offset de días dentro de cada semana, según frecuencia.
// Indexado por day_index del template (1..N).
// 5 y 6 días: usados por los planes pro (Sarah). Asumimos lunes descanso →
// martes a sábado/domingo.
const DAY_OFFSETS: Record<number, number[]> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// Mapeo perfil → template. Cubre la matriz experience_level × goal_type.
// Casos no contemplados devuelven null y el frontend muestra "tu plan está en camino".
//
// Advanced + weekly_days < 4 hace down-grade a calle_trail_base_3d porque el
// único plan avanzado seedeado pide 4 días. Si en el futuro creamos variantes,
// se ramifica acá.
function pickTemplateCode(
  experienceLevel: ExperienceLevel,
  goalType: GoalType,
  weeklyDays: number
): string | null {
  if (experienceLevel === 'new') {
    // Por ahora todos los principiantes arrancan con run-walk.
    // Cuando seedeemos algo específico para calle_trail principiante, ramificar acá.
    return 'desde_cero_3d'
  }

  if (experienceLevel === 'base') {
    switch (goalType) {
      case 'calle':
        return 'nuevo_calle_3d'
      case 'calle_trail':
        return 'calle_trail_base_3d'
      case 'trail':
        return 'nuevo_montana_3d'
    }
  }

  if (experienceLevel === 'advanced') {
    if (weeklyDays >= 4) return 'calle_trail_avanzado_4d'
    return 'calle_trail_base_3d'
  }

  return null
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

  // 3. Mapping de perfil → template.
  const templateCode = pickTemplateCode(
    profile.experience_level,
    profile.goal_type,
    profile.weekly_days
  )
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
    throw new Error(`No hay template_sessions para ${templateCode}`)
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
  totalDurationMin: number // ya ajustada por duration_modifier
  durationModifier: number
  adaptationNote: string | null
  distanceLabel: string | null
  blocks: ResolvedBlock[]
}

export type PlanSessionSummary = {
  userSessionId: string
  status: SessionStatus
  scheduledDate: string
  sessionName: string
  totalDurationMin: number // ya ajustada
  durationModifier: number
  adaptationNote: string | null
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

  type TemplateRow = {
    session_name: string
    blocks: SessionBlock[]
    total_duration_min: number
    is_deload: boolean
    week_number: number
    distance_label: string | null
  }
  type SessionRow = {
    id: string
    status: SessionStatus
    scheduled_date: string
    duration_modifier: number
    adaptation_note: string | null
    template_session: TemplateRow | TemplateRow[] | null
  }

  const { data: rawSession } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      status,
      scheduled_date,
      duration_modifier,
      adaptation_note,
      template_session:template_sessions (
        session_name,
        blocks,
        total_duration_min,
        is_deload,
        week_number,
        distance_label
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

  const modifier = Number(rawSession.duration_modifier ?? 1.0)
  const adjustedTotal = Math.round(tmpl.total_duration_min * modifier)

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
    totalDurationMin: adjustedTotal,
    durationModifier: modifier,
    adaptationNote: rawSession.adaptation_note,
    distanceLabel: tmpl.distance_label,
    blocks: tmpl.blocks.map((b) => ({
      code: b.code,
      name: nameByCode.get(b.code) ?? b.code,
      durationMin: Math.round(b.duration_min * modifier),
      note: b.note,
    })),
  }
}

// Detalle completo de una sesión por id, con bloques resueltos (nombre + descripción).
// Verifica ownership: si la sesión no pertenece al usuario, retorna null.
export type SessionDetail = {
  userSessionId: string
  status: SessionStatus
  scheduledDate: string
  completedAt: string | null
  name: string
  isDeload: boolean
  weekNumber: number
  totalDurationMin: number
  durationModifier: number
  adaptationNote: string | null
  distanceLabel: string | null
  blocks: {
    code: string
    name: string
    description: string | null
    durationMin: number
    note?: string
  }[]
}

export async function getSessionById(
  userSessionId: string,
  userId: string
): Promise<SessionDetail | null> {
  const supabase = await createClient()

  type TemplateRow = {
    session_name: string
    blocks: SessionBlock[]
    total_duration_min: number
    is_deload: boolean
    week_number: number
    distance_label: string | null
  }
  type Row = {
    id: string
    status: SessionStatus
    scheduled_date: string
    completed_at: string | null
    duration_modifier: number
    adaptation_note: string | null
    user_plan: { user_id: string } | { user_id: string }[] | null
    template_session: TemplateRow | TemplateRow[] | null
  }

  const { data: row } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      status,
      scheduled_date,
      completed_at,
      duration_modifier,
      adaptation_note,
      user_plan:user_plans ( user_id ),
      template_session:template_sessions (
        session_name,
        blocks,
        total_duration_min,
        is_deload,
        week_number,
        distance_label
      )
    `
    )
    .eq('id', userSessionId)
    .maybeSingle<Row>()

  if (!row) return null
  const plan = Array.isArray(row.user_plan) ? row.user_plan[0] : row.user_plan
  if (!plan || plan.user_id !== userId) return null
  const tmpl = Array.isArray(row.template_session)
    ? row.template_session[0]
    : row.template_session
  if (!tmpl) return null

  const modifier = Number(row.duration_modifier ?? 1.0)

  const codes = tmpl.blocks.map((b) => b.code)
  const { data: blockRows } = await supabase
    .from('workout_blocks')
    .select('code, name, description')
    .in('code', codes)
  const blockByCode = new Map(
    (blockRows ?? []).map((b: { code: string; name: string; description: string | null }) => [
      b.code,
      b,
    ])
  )

  return {
    userSessionId: row.id,
    status: row.status,
    scheduledDate: row.scheduled_date,
    completedAt: row.completed_at,
    name: tmpl.session_name,
    isDeload: tmpl.is_deload,
    weekNumber: tmpl.week_number,
    totalDurationMin: Math.round(tmpl.total_duration_min * modifier),
    durationModifier: modifier,
    adaptationNote: row.adaptation_note,
    distanceLabel: tmpl.distance_label,
    blocks: tmpl.blocks.map((b) => {
      const meta = blockByCode.get(b.code)
      return {
        code: b.code,
        name: meta?.name ?? b.code,
        description: meta?.description ?? null,
        durationMin: Math.round(b.duration_min * modifier),
        note: b.note,
      }
    }),
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
    duration_modifier: number
    adaptation_note: string | null
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
      duration_modifier,
      adaptation_note,
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
      const modifier = Number(r.duration_modifier ?? 1.0)
      return {
        weekNumber: t.week_number,
        userSessionId: r.id,
        status: r.status,
        scheduledDate: r.scheduled_date,
        sessionName: t.session_name,
        totalDurationMin: Math.round(t.total_duration_min * modifier),
        durationModifier: modifier,
        adaptationNote: r.adaptation_note,
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

// Rate limit y re-asignación de plan -------------------------------------

export type ChangePlanCheck = {
  allowed: boolean
  reason?: string
  nextAllowedAt?: string // ISO datetime
  hoursRemaining?: number
}

// El usuario puede reasignar plan a lo sumo 1 vez cada 24h.
// Basado en el created_at del plan activo (cada reasignación crea uno nuevo).
export async function canChangePlan(userId: string): Promise<ChangePlanCheck> {
  const supabase = await createClient()
  const { data: plan } = await supabase
    .from('user_plans')
    .select('created_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle<{ created_at: string }>()

  // Si no hay plan activo, permitir (es el primer plan).
  if (!plan) return { allowed: true }

  const createdMs = new Date(plan.created_at).getTime()
  const nowMs = Date.now()
  const elapsedH = (nowMs - createdMs) / (1000 * 60 * 60)
  if (elapsedH >= 24) return { allowed: true }

  const nextAllowedMs = createdMs + 24 * 60 * 60 * 1000
  return {
    allowed: false,
    reason: 'Cambiaste tu plan hace menos de 24 horas.',
    nextAllowedAt: new Date(nextAllowedMs).toISOString(),
    hoursRemaining: Math.ceil(24 - elapsedH),
  }
}

// Re-asigna plan: marca el activo como canceled y crea uno nuevo
// según el perfil actual. No chequea rate limit — eso lo hace el caller.
export async function reassignPlan(userId: string): Promise<string | null> {
  const supabase = await createClient()
  await supabase
    .from('user_plans')
    .update({ status: 'canceled' })
    .eq('user_id', userId)
    .eq('status', 'active')

  return assignPlan(userId)
}

// Lista de planes pro (is_pro=true) para mostrar en cambiar-plan.
export type ProPlanSummary = {
  code: string
  name: string
  description: string | null
  weeklyDays: number
  totalWeeks: number
}

export async function listProPlans(): Promise<ProPlanSummary[]> {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('plan_templates')
    .select('code, name, description, weekly_days, total_weeks')
    .eq('is_pro', true)
    .order('total_weeks', { ascending: true })
    .returns<
      {
        code: string
        name: string
        description: string | null
        weekly_days: number
        total_weeks: number
      }[]
    >()

  return (rows ?? []).map((r) => ({
    code: r.code,
    name: r.name,
    description: r.description,
    weeklyDays: r.weekly_days,
    totalWeeks: r.total_weeks,
  }))
}

// Graduación: cancela el plan activo y asigna el target template directo,
// saltando el pickTemplateCode. Lo usa el flow de "estás listo para tu
// próximo plan" cuando el gate engine marca graduation_ready. weekly_days
// del usuario sirve para mapear el scheduled_date (si el target tiene más
// días de los que el user pidió, se usa el del target).
export async function graduate(
  userId: string,
  targetTemplateCode: string
): Promise<string | null> {
  const supabase = await createClient()

  const { data: template } = await supabase
    .from('plan_templates')
    .select('id, weekly_days')
    .eq('code', targetTemplateCode)
    .maybeSingle<{ id: string; weekly_days: number }>()
  if (!template) throw new Error(`Template ${targetTemplateCode} no existe`)

  await supabase
    .from('user_plans')
    .update({ status: 'canceled' })
    .eq('user_id', userId)
    .eq('status', 'active')

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

  const { data: tmplSessions } = await supabase
    .from('template_sessions')
    .select('id, week_number, day_index')
    .eq('template_id', template.id)
    .order('week_number', { ascending: true })
    .order('day_index', { ascending: true })
  if (!tmplSessions || tmplSessions.length === 0) {
    throw new Error(`No hay template_sessions para ${targetTemplateCode}`)
  }

  const offsets = DAY_OFFSETS[template.weekly_days] ?? DAY_OFFSETS[3]
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
