import { createClient } from '@/lib/supabase/server'

export type WeeklySummary = {
  weekNumber: number
  rangeLabel: string
  volumeMin: number
  rpeAvg: number | null
  easyPct: number | null
}

const MONTHS_ES_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

function startOfWeek(d: Date): Date {
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  const s = new Date(d)
  s.setUTCDate(d.getUTCDate() - diff)
  s.setUTCHours(0, 0, 0, 0)
  return s
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatRange(start: Date, end: Date): string {
  const sM = MONTHS_ES_SHORT[start.getUTCMonth()]
  const eM = MONTHS_ES_SHORT[end.getUTCMonth()]
  const sD = start.getUTCDate()
  const eD = end.getUTCDate()
  if (sM === eM) return `${sD} → ${eD} ${eM}`
  return `${sD} ${sM} → ${eD} ${eM}`
}

export async function getWeeklySummary(
  userId: string
): Promise<WeeklySummary | null> {
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('user_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  if (!plan) return null

  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)

  type Row = {
    id: string
    status: string
    duration_modifier: number
    template_session:
      | {
          total_duration_min: number
          week_number: number
        }
      | { total_duration_min: number; week_number: number }[]
      | null
  }

  const { data: sessions } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      status,
      duration_modifier,
      template_session:template_sessions (
        total_duration_min,
        week_number
      )
    `
    )
    .eq('user_plan_id', plan.id)
    .gte('scheduled_date', isoDate(weekStart))
    .lte('scheduled_date', isoDate(weekEnd))
    .returns<Row[]>()

  if (!sessions || sessions.length === 0) return null

  const completed = sessions.filter((s) => s.status === 'completed')
  if (completed.length === 0) return null

  let volumeMin = 0
  let weekNumber = 0
  const completedIds: string[] = []
  for (const s of completed) {
    const t = Array.isArray(s.template_session)
      ? s.template_session[0]
      : s.template_session
    if (!t) continue
    const adjusted = Math.round(
      t.total_duration_min * Number(s.duration_modifier ?? 1)
    )
    volumeMin += adjusted
    if (t.week_number > weekNumber) weekNumber = t.week_number
    completedIds.push(s.id)
  }

  let rpeAvg: number | null = null
  let easyPct: number | null = null
  if (completedIds.length > 0) {
    const { data: checkins } = await supabase
      .from('session_checkins')
      .select('rpe, talk_test')
      .in('user_session_id', completedIds)
    if (checkins && checkins.length > 0) {
      const rpeSum = checkins.reduce(
        (acc: number, c: { rpe: number | null }) => acc + (c.rpe ?? 0),
        0
      )
      const rpeCount = checkins.filter(
        (c: { rpe: number | null }) => c.rpe != null
      ).length
      rpeAvg = rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : null

      const easy = checkins.filter(
        (c: { talk_test: string | null }) => c.talk_test === 'phrases'
      ).length
      easyPct = Math.round((easy / checkins.length) * 100)
    }
  }

  return {
    weekNumber,
    rangeLabel: formatRange(weekStart, weekEnd),
    volumeMin,
    rpeAvg,
    easyPct,
  }
}
