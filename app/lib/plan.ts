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
export type TodaySession = {
  userSessionId: string
  status: SessionStatus
  scheduledDate: string
  name: string
  isDeload: boolean
  weekNumber: number
  totalDurationMin: number
  blocks: { code: string; name: string; durationMin: number; note?: string }[]
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
