import { createAdminClient } from './supabase'
import type {
  SubscriptionPlan,
  SubscriptionStatus,
  Currency,
  PaymentMethod,
} from '@/types/database'

const TRIAL_DAYS = 7

const DAY_MS = 1000 * 60 * 60 * 24

export type DashboardMetrics = {
  totalSignups: number
  trialActive: number
  paidActive: number
  expired: number
  canceled: number
  revenueArs: number
  revenueUsd: number
  signupsLast7: number
  signupsLast30: number
  paidLast7: number
  paidLast30: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supa = createAdminClient()

  const now = new Date()
  const d7 = new Date(now.getTime() - 7 * DAY_MS).toISOString()
  const d30 = new Date(now.getTime() - 30 * DAY_MS).toISOString()

  const [
    { count: totalSignups },
    { data: subs },
    { count: signupsLast7 },
    { count: signupsLast30 },
  ] = await Promise.all([
    supa.from('profiles').select('id', { count: 'exact', head: true }),
    supa.from('subscriptions').select('status,plan,amount,currency,updated_at'),
    supa
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', d7),
    supa
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', d30),
  ])

  const byStatus = {
    trialing: 0,
    active: 0,
    canceled: 0,
    expired: 0,
  } as Record<SubscriptionStatus, number>
  let revenueArs = 0
  let revenueUsd = 0
  let paidLast7 = 0
  let paidLast30 = 0

  for (const s of subs ?? []) {
    byStatus[s.status as SubscriptionStatus] =
      (byStatus[s.status as SubscriptionStatus] ?? 0) + 1
    if (s.status === 'active' && s.amount) {
      if (s.currency === 'ARS') revenueArs += s.amount
      if (s.currency === 'USD') revenueUsd += s.amount
      if (s.updated_at && s.updated_at >= d7) paidLast7 += 1
      if (s.updated_at && s.updated_at >= d30) paidLast30 += 1
    }
  }

  return {
    totalSignups: totalSignups ?? 0,
    trialActive: byStatus.trialing,
    paidActive: byStatus.active,
    expired: byStatus.expired,
    canceled: byStatus.canceled,
    revenueArs,
    revenueUsd,
    signupsLast7: signupsLast7 ?? 0,
    signupsLast30: signupsLast30 ?? 0,
    paidLast7,
    paidLast30,
  }
}

export type FunnelStage = {
  key: string
  label: string
  count: number
  pct: number
}

export async function getFunnelStages(): Promise<FunnelStage[]> {
  const supa = createAdminClient()

  const [
    { count: signups },
    { count: onboarded },
    { data: usersWithSession },
    { data: usersWithCheckin },
    { count: paid },
  ] = await Promise.all([
    supa.from('profiles').select('id', { count: 'exact', head: true }),
    supa
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .not('experience_level', 'is', null)
      .not('goal_type', 'is', null)
      .not('weekly_days', 'is', null),
    supa
      .from('user_sessions')
      .select('user_plans!inner(user_id)')
      .eq('status', 'completed')
      .limit(10000),
    supa.from('session_checkins').select('user_session_id').limit(10000),
    supa
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ])

  const distinctSessionUsers = new Set(
    (usersWithSession ?? [])
      .map((r) => {
        const up = r.user_plans as unknown as { user_id?: string } | { user_id?: string }[] | null
        if (Array.isArray(up)) return up[0]?.user_id
        return up?.user_id
      })
      .filter((v): v is string => typeof v === 'string'),
  ).size
  const distinctCheckinSessions = new Set(
    (usersWithCheckin ?? []).map((r) => r.user_session_id),
  ).size

  const total = signups ?? 0
  const stages: Omit<FunnelStage, 'pct'>[] = [
    { key: 'signup', label: 'Se registró', count: total },
    {
      key: 'onboarded',
      label: 'Completó onboarding',
      count: onboarded ?? 0,
    },
    {
      key: 'first_session',
      label: 'Hizo primera sesión',
      count: distinctSessionUsers,
    },
    {
      key: 'first_checkin',
      label: 'Hizo primer check-in',
      count: distinctCheckinSessions,
    },
    { key: 'paid', label: 'Pagó suscripción', count: paid ?? 0 },
  ]

  return stages.map((s) => ({
    ...s,
    pct: total > 0 ? Math.round((s.count / total) * 1000) / 10 : 0,
  }))
}

export type UserRow = {
  id: string
  email: string
  name: string | null
  country: string | null
  signedUpOn: string
  trialDay: number | null
  status: SubscriptionStatus | null
  plan: SubscriptionPlan | null
  paymentMethod: PaymentMethod | null
  currency: Currency | null
  amount: number | null
  periodEnd: string | null
  paidSince: string | null
  daysOnSub: number | null
  lastSignInAt: string | null
  lastSessionAt: string | null
  lastCheckinAt: string | null
}

export async function getUsers(): Promise<UserRow[]> {
  const supa = createAdminClient()

  const [
    { data: profiles },
    { data: subs },
    { data: completedSessions },
    { data: checkins },
    authList,
  ] = await Promise.all([
    supa
      .from('profiles')
      .select('id,email,name,country,created_at')
      .order('created_at', { ascending: false }),
    supa
      .from('subscriptions')
      .select(
        'user_id,status,plan,payment_method,currency,amount,current_period_end,trial_started_on,updated_at',
      ),
    // user_sessions completadas + user_id (vía user_plans). Limit alto para
    // que entren todas las sesiones del MVP; cuando crezca la base, mover
    // a una VIEW agregada o RPC con max(completed_at) group by user_id.
    supa
      .from('user_sessions')
      .select('completed_at, user_plans!inner(user_id)')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(50000),
    // session_checkins + user_id (vía user_sessions → user_plans).
    supa
      .from('session_checkins')
      .select(
        'created_at, user_session:user_sessions!inner(user_plan:user_plans!inner(user_id))',
      )
      .order('created_at', { ascending: false })
      .limit(50000),
    // Auth users con last_sign_in_at: solo accesible via auth.admin con
    // service-role key. listUsers retorna paginado.
    supa.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const subsById = new Map(
    (subs ?? []).map((s) => [s.user_id, s] as const),
  )

  // Helper para extraer user_id desde nested select (Supabase devuelve obj | obj[])
  const userIdFromNested = (
    nested: unknown,
    path: string[],
  ): string | undefined => {
    let cur: unknown = nested
    for (const key of path) {
      if (Array.isArray(cur)) cur = cur[0]
      if (cur && typeof cur === 'object' && key in cur) {
        cur = (cur as Record<string, unknown>)[key]
      } else {
        return undefined
      }
    }
    return typeof cur === 'string' ? cur : undefined
  }

  // Map user_id → max(completed_at) y user_id → max(created_at de checkin)
  const lastSessionByUser = new Map<string, string>()
  for (const s of completedSessions ?? []) {
    const uid = userIdFromNested(s.user_plans, ['user_id'])
    if (!uid || !s.completed_at) continue
    if (!lastSessionByUser.has(uid)) {
      lastSessionByUser.set(uid, s.completed_at)
    }
  }

  const lastCheckinByUser = new Map<string, string>()
  for (const c of checkins ?? []) {
    const uid = userIdFromNested(c.user_session, ['user_plan', 'user_id'])
    if (!uid || !c.created_at) continue
    if (!lastCheckinByUser.has(uid)) {
      lastCheckinByUser.set(uid, c.created_at)
    }
  }

  const lastSignInByUser = new Map<string, string>()
  for (const u of authList.data?.users ?? []) {
    if (u.last_sign_in_at) lastSignInByUser.set(u.id, u.last_sign_in_at)
  }

  const now = Date.now()

  return (profiles ?? []).map((p) => {
    const sub = subsById.get(p.id)
    const signedUpOn = p.created_at
    const trialStartedMs = sub?.trial_started_on
      ? new Date(`${sub.trial_started_on}T00:00:00Z`).getTime()
      : new Date(p.created_at).getTime()

    const daysSinceTrialStart = Math.floor((now - trialStartedMs) / DAY_MS)
    const trialDay =
      sub?.status === 'trialing'
        ? Math.max(1, Math.min(daysSinceTrialStart + 1, TRIAL_DAYS))
        : null

    let paidSince: string | null = null
    let daysOnSub: number | null = null
    if (sub?.status === 'active' && sub.updated_at) {
      paidSince = sub.updated_at
      daysOnSub = Math.max(
        0,
        Math.floor((now - new Date(sub.updated_at).getTime()) / DAY_MS),
      )
    }

    return {
      id: p.id,
      email: p.email,
      name: p.name,
      country: p.country,
      signedUpOn,
      trialDay,
      status: sub?.status ?? null,
      plan: sub?.plan ?? null,
      paymentMethod: sub?.payment_method ?? null,
      currency: sub?.currency ?? null,
      amount: sub?.amount ?? null,
      periodEnd: sub?.current_period_end ?? null,
      paidSince,
      daysOnSub,
      lastSignInAt: lastSignInByUser.get(p.id) ?? null,
      lastSessionAt: lastSessionByUser.get(p.id) ?? null,
      lastCheckinAt: lastCheckinByUser.get(p.id) ?? null,
    }
  })
}
