import { NextResponse } from 'next/server'
import { verifyCommetSignature, intervalToPlan } from '@/lib/commet'
import { createAdminClient } from '@/lib/supabase/admin'
import { PRICING } from '@/lib/subscription'
import type { Currency, SubscriptionPlan } from '@/types/database'

// POST /api/commet/webhook
// Configurar este URL en el dashboard de Commet (sección Webhooks):
//   https://app.flowrun.site/api/commet/webhook
// El secret que muestre Commet va a COMMET_WEBHOOK_SECRET.
export async function POST(request: Request) {
  // Necesitamos el body como string para verificar la firma.
  const rawBody = await request.text()
  const signature = request.headers.get('x-commet-signature')

  if (!verifyCommetSignature(rawBody, signature)) {
    return NextResponse.json(
      { ok: false, error: 'invalid signature' },
      { status: 401 }
    )
  }

  type WebhookPayload = {
    event: string
    timestamp: string
    organizationId: string
    data: Record<string, unknown>
  }

  const payload = JSON.parse(rawBody) as WebhookPayload
  const data = payload.data

  // Extraer user_id (externalId del customer, o metadata). Defensivo: probamos
  // varias rutas porque el shape exacto de `data` varía por evento.
  const userId = pickUserId(data)
  if (!userId) {
    return NextResponse.json({ ok: true, warning: 'no userId in payload' })
  }

  const supabase = createAdminClient()
  const plan = pickPlan(data)

  switch (payload.event) {
    case 'subscription.activated':
    case 'payment.received': {
      // Activar (primera vez) o renovar (siguientes cobros).
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan,
          payment_method: 'card',
          currency: pickCurrency(data),
          amount: pickAmount(data),
          current_period_end: computePeriodEnd(data, plan),
        })
        .eq('user_id', userId)
      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        )
      }
      break
    }

    case 'subscription.canceled': {
      // Cancelación. Dejamos current_period_end como está — el usuario sigue
      // teniendo acceso hasta el final del período pagado, y ahí se vuelve
      // 'expired' vía isLocked.
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', userId)
      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        )
      }
      break
    }

    case 'payment.failed':
    case 'subscription.updated':
    default:
      // No-op por ahora. Si el pago falla, dejamos que el período corra y
      // que isLocked maneje el bloqueo cuando venza.
      break
  }

  return NextResponse.json({ ok: true })
}

// ----- helpers para tolerar variaciones del payload -----
//
// El payload real de Commet es PLANO (data.customerId, data.currentPeriodEnd,
// data.invoiceTotal, data.invoiceCurrency, etc.) — NO anidado. Mantengo
// fallbacks por si algún evento manda shape distinto.

type AnyData = Record<string, unknown> & {
  // shape plano (real de Commet)
  customerId?: string
  subscriptionId?: string
  billingInterval?: string
  currency?: string
  invoiceCurrency?: string
  invoiceTotal?: number
  grossAmount?: number
  amount?: number
  currentPeriodEnd?: string
  // shape anidado (fallback)
  customer?: { externalId?: string; metadata?: Record<string, unknown> }
  subscription?: {
    customer?: { externalId?: string }
    billingInterval?: string
    currency?: string
    price?: number
    currentPeriodEnd?: string
    metadata?: Record<string, unknown>
  }
  payment?: { amount?: number; currency?: string }
  metadata?: Record<string, unknown>
}

function pickUserId(d: AnyData): string | null {
  return (
    // shape real: customerId al top — es nuestro externalId si lo pasamos al
    // crear el customer (lo hicimos = user.id de Supabase), sino publicId.
    (d?.customerId as string | undefined) ??
    // fallbacks por si algún evento manda formato anidado
    d?.customer?.externalId ??
    d?.subscription?.customer?.externalId ??
    (d?.metadata?.userId as string | undefined) ??
    (d?.subscription?.metadata?.userId as string | undefined) ??
    null
  )
}

function pickCurrency(d: AnyData): Currency {
  const cur =
    d?.invoiceCurrency ?? // subscription.activated
    d?.currency ?? //         payment.received
    d?.subscription?.currency ??
    d?.payment?.currency ??
    'USD'
  return String(cur).toUpperCase() === 'ARS' ? 'ARS' : 'USD'
}

// Amount en minor units (cents) tal como Commet lo manda.
function pickRawAmount(d: AnyData): number {
  const v =
    d?.invoiceTotal ?? //   subscription.activated
    d?.grossAmount ?? //    payment.received
    d?.subscription?.price ??
    d?.payment?.amount ??
    d?.amount ??
    null
  return typeof v === 'number' ? v : 0
}

// Convención del schema: USD en cents, ARS en pesos enteros.
// Commet siempre manda minor units → para ARS dividimos por 100.
function pickAmount(d: AnyData): number {
  const raw = pickRawAmount(d)
  if (pickCurrency(d) === 'ARS') return Math.round(raw / 100)
  return raw
}

function pickPlan(d: AnyData): SubscriptionPlan {
  // Si vino explícito, lo usamos.
  const interval =
    (d?.billingInterval as string | undefined) ??
    (d?.subscription?.billingInterval as string | undefined)
  if (interval) return intervalToPlan(interval)

  // Si no, derivamos del amount normalizado contra los precios conocidos.
  const amount = pickAmount(d)
  const cur = pickCurrency(d)
  if (cur === 'ARS') {
    return amount === PRICING.pack_3m.ars ? 'pack_3m' : 'monthly'
  }
  return amount === PRICING.pack_3m.usd ? 'pack_3m' : 'monthly'
}

function computePeriodEnd(d: AnyData, plan: SubscriptionPlan): string {
  const cpe =
    (d?.currentPeriodEnd as string | undefined) ??
    (d?.subscription?.currentPeriodEnd as string | undefined)
  if (cpe) return new Date(cpe).toISOString().slice(0, 10)
  // Fallback: +days desde hoy según el plan.
  const days = PRICING[plan].days
  const end = new Date()
  end.setUTCDate(end.getUTCDate() + days)
  return end.toISOString().slice(0, 10)
}
