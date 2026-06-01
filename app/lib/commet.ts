import crypto from 'node:crypto'
import type { SubscriptionPlan } from '@/types/database'

// Cliente minimal de Commet. Usamos la REST API directamente con fetch para
// no agregar una dependencia más. Si la URL base cambia, se override con
// COMMET_API_URL en env. Confirmado vía debug docs: base es commet.co/api.
const API_URL = process.env.COMMET_API_URL ?? 'https://commet.co/api'

// Mapeo FlowRun → Commet.
// FlowRun usa 'monthly' y 'pack_3m'. Commet usa 'monthly' y 'quarterly'.
export const PLAN_TO_BILLING_INTERVAL: Record<
  SubscriptionPlan,
  'monthly' | 'quarterly'
> = {
  monthly: 'monthly',
  pack_3m: 'quarterly',
}

export function intervalToPlan(
  interval: string | undefined | null
): SubscriptionPlan {
  return interval === 'quarterly' ? 'pack_3m' : 'monthly'
}

// Código del plan en Commet (org "Santi flowrun"). Si lo renombrás en el
// dashboard, actualizá acá.
export const FLOWRUN_PLAN_CODE = 'flowrun_premium'

function authHeaders(): Record<string, string> {
  const apiKey = process.env.COMMET_API_KEY
  if (!apiKey) throw new Error('COMMET_API_KEY no configurada')
  // Commet usa x-api-key (no Authorization: Bearer).
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  }
}

// --- API: customer upsert ---------------------------------------------------

// Crea (o devuelve, idempotente vía externalId) el customer en Commet.
// El externalId que pasamos es el user.id de Supabase — eso nos permite
// matchear los eventos del webhook con la fila correcta.
async function upsertCommetCustomer(input: {
  userId: string
  userEmail: string
  country?: string | null
}): Promise<void> {
  const body: Record<string, unknown> = {
    externalId: input.userId,
    billingEmail: input.userEmail,
    metadata: { source: 'flowrun-app' },
  }
  // Si tenemos el país, lo pasamos — Commet lo usa para resolver la moneda
  // del checkout (AR → ARS via regional prices). Sin esto defaultea a USD.
  if (input.country) body.country = input.country

  const res = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })

  // 201 = creado, 200/409 = ya existía. Otros = error.
  if (res.status === 201 || res.status === 200 || res.status === 409) return
  const errBody = await res.text()
  throw new Error(`Commet customer upsert failed ${res.status}: ${errBody}`)
}

// --- API: crear checkout/suscripción ----------------------------------------

type CheckoutInput = {
  userId: string
  userEmail: string
  plan: SubscriptionPlan
  successUrl: string
  country?: string | null
}

type CheckoutResponse = {
  checkoutUrl: string
}

export async function createCommetCheckout(
  input: CheckoutInput
): Promise<CheckoutResponse> {
  // 1) Asegurar que el customer exista en Commet (Commet NO lo crea solo).
  await upsertCommetCustomer({
    userId: input.userId,
    userEmail: input.userEmail,
    country: input.country,
  })

  // 2) Crear la suscripción / checkout.
  const res = await fetch(`${API_URL}/subscriptions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      // customerId acepta el externalId (string) que usamos arriba.
      customerId: input.userId,
      planCode: FLOWRUN_PLAN_CODE,
      billingInterval: PLAN_TO_BILLING_INTERVAL[input.plan],
      successUrl: input.successUrl,
      // El trial de 15 días lo maneja FlowRun en DB. No queremos uno extra.
      skipTrial: true,
      metadata: { source: 'flowrun-app', userId: input.userId },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Commet checkout failed ${res.status}: ${body}`)
  }

  const data = await res.json()
  // El campo de URL puede venir como checkoutUrl o data.checkoutUrl según
  // el wrapping de respuesta. Cubrimos las dos formas.
  const url = data?.checkoutUrl ?? data?.data?.checkoutUrl
  if (!url) throw new Error('Commet checkout no devolvió checkoutUrl')
  return { checkoutUrl: url }
}

// --- API: cancelar suscripción ----------------------------------------------

// Cancela la suscripción activa del usuario. Por default cancela al final del
// período actual (immediate=false) — el user mantiene acceso hasta vencer.
// Si no hay suscripción activa en Commet, tira error.
export async function cancelCommetSubscription(input: {
  userId: string
  immediate?: boolean
}): Promise<{ canceledAt: string; periodEnd: string | null }> {
  // 1) Listar suscripciones del customer (Commet acepta externalId como customerId).
  const listRes = await fetch(
    `${API_URL}/subscriptions?customerId=${encodeURIComponent(input.userId)}`,
    { method: 'GET', headers: authHeaders() }
  )
  if (!listRes.ok) {
    const body = await listRes.text()
    throw new Error(`Commet list subscriptions failed ${listRes.status}: ${body}`)
  }
  const list = await listRes.json()
  const subs: Array<{ id: string; status: string; currentPeriodEnd?: string }> =
    list?.data ?? []
  const active = subs.find(
    (s) => s.status === 'active' || s.status === 'trialing'
  )
  if (!active) {
    throw new Error('No hay suscripción activa para cancelar')
  }

  // 2) Cancelar.
  const cancelRes = await fetch(
    `${API_URL}/subscriptions/${active.id}/cancel`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        immediate: input.immediate ?? false,
        reason: 'user_request',
      }),
    }
  )
  if (!cancelRes.ok) {
    const body = await cancelRes.text()
    throw new Error(`Commet cancel failed ${cancelRes.status}: ${body}`)
  }
  const data = await cancelRes.json()
  const result = data?.data ?? data
  return {
    canceledAt: result?.canceledAt ?? new Date().toISOString(),
    periodEnd: active.currentPeriodEnd ?? null,
  }
}

// --- Webhook: verificación de firma -----------------------------------------

// Commet manda HMAC-SHA256 en hex en el header X-Commet-Signature, calculado
// sobre el body crudo.
export function verifyCommetSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.COMMET_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  if (signature.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false
  }
}
