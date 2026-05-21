import { createClient } from '@/lib/supabase/server'
import type {
  Currency,
  PaymentMethod,
  SubscriptionPlan,
  SubscriptionRow,
} from '@/types/database'

// Pricing fijo. Single source of truth — UI lo lee desde acá.
export const PRICING: Record<
  SubscriptionPlan,
  { ars: number; usd: number; days: number; labelEs: string }
> = {
  monthly: { ars: 7000, usd: 500, days: 30, labelEs: 'Mensual' },
  pack_3m: { ars: 18000, usd: 1200, days: 90, labelEs: 'Pack 3 meses' },
}

export async function getSubscription(
  userId: string
): Promise<SubscriptionRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<SubscriptionRow>()
  return data
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// Días enteros que quedan hasta current_period_end. 0 si vencido.
export function daysRemaining(sub: SubscriptionRow): number {
  const today = new Date(`${todayIso()}T00:00:00Z`).getTime()
  const end = new Date(`${sub.current_period_end}T00:00:00Z`).getTime()
  const diffMs = end - today
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// Bloqueamos cuando: el periodo (trial o pago) venció.
// active sin vencer = OK. trialing sin vencer = OK. Resto = bloqueado.
export function isLocked(sub: SubscriptionRow | null): boolean {
  if (!sub) return false // nunca debería pasar gracias al trigger, pero por seguridad
  if (sub.status === 'canceled' || sub.status === 'expired') return true
  return daysRemaining(sub) === 0
}

export type AccessState = {
  status: 'trial' | 'paid' | 'expired'
  daysLeft: number
  plan: SubscriptionPlan | null
  periodEnd: string
}

export function getAccessState(sub: SubscriptionRow | null): AccessState {
  if (!sub) {
    return { status: 'expired', daysLeft: 0, plan: null, periodEnd: todayIso() }
  }
  const daysLeft = daysRemaining(sub)
  if (isLocked(sub)) {
    return {
      status: 'expired',
      daysLeft: 0,
      plan: sub.plan,
      periodEnd: sub.current_period_end,
    }
  }
  return {
    status: sub.status === 'trialing' ? 'trial' : 'paid',
    daysLeft,
    plan: sub.plan,
    periodEnd: sub.current_period_end,
  }
}
