'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { cancelCommetSubscription, createCommetCheckout } from '@/lib/commet'
import type {
  Currency,
  PaymentMethod,
  SubscriptionPlan,
} from '@/types/database'

// Crea una sesión de checkout en Commet y redirige al usuario al pago.
// La fila en `subscriptions` queda como está (trialing) hasta que llegue el
// webhook `subscription.activated` o `payment.received` — ahí se marca
// `active` con plan/monto/fin de período.
//
// paymentMethod/currency vienen de los botones de la UI por compat: por
// ahora Commet ofrece el método al usuario en su propio checkout, así que
// no los usamos del lado server.
export async function subscribePlan(input: {
  plan: SubscriptionPlan
  paymentMethod: PaymentMethod
  currency: Currency
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')
  if (!user.email) throw new Error('Usuario sin email')

  // Obtener country del profile para que Commet aplique los regional prices
  // (ej. AR → ARS). Sin esto el checkout defaultea a USD.
  const { data: profile } = await supabase
    .from('profiles')
    .select('country')
    .eq('id', user.id)
    .single()

  // Calcular la URL de retorno (success) según el host actual.
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const host =
    h.get('x-forwarded-host') ?? h.get('host') ?? 'app.flowrun.site'
  const successUrl = `${proto}://${host}/suscripcion?ok=1`

  const { checkoutUrl } = await createCommetCheckout({
    userId: user.id,
    userEmail: user.email,
    plan: input.plan,
    successUrl,
    country: profile?.country ?? null,
  })

  redirect(checkoutUrl)
}

// Cancela la suscripción del user al final del período actual. Mantiene
// acceso hasta current_period_end. Cuando Commet llegue al final del período
// disparará el webhook subscription.canceled y el handler marcará la fila
// como 'canceled'.
export async function cancelSubscription(): Promise<{ periodEnd: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const result = await cancelCommetSubscription({ userId: user.id })

  revalidatePath('/suscripcion')
  revalidatePath('/perfil')
  revalidatePath('/dashboard')
  return { periodEnd: result.periodEnd }
}
