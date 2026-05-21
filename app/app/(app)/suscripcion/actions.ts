'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PRICING } from '@/lib/subscription'
import type {
  Currency,
  PaymentMethod,
  SubscriptionPlan,
} from '@/types/database'

// Mock de pago. Marca la subscription como active, setea plan/método/moneda/
// monto y extiende current_period_end según los días del plan.
// El backend real (Stripe / MP) reemplazará esto sin cambiar la interfaz UI.
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

  const pricing = PRICING[input.plan]
  const amount = input.currency === 'ARS' ? pricing.ars : pricing.usd

  // Calcular nueva fecha de fin: a partir de hoy, NO se extiende encima del trial.
  // Esto es coherente con la idea "pagás → arrancan los días pagos desde ahora".
  const today = new Date()
  const periodEnd = new Date(today)
  periodEnd.setUTCDate(periodEnd.getUTCDate() + pricing.days)
  const periodEndIso = periodEnd.toISOString().slice(0, 10)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      plan: input.plan,
      payment_method: input.paymentMethod,
      currency: input.currency,
      amount,
      current_period_end: periodEndIso,
    })
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  revalidatePath('/perfil')
  revalidatePath('/suscripcion')
  redirect('/perfil')
}
