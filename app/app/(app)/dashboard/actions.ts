'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { graduate } from '@/lib/plan'
import { getPendingGraduation } from '@/lib/gate'

// Acepta la oferta de graduación: cancela el plan actual y materializa el
// target template definido por el gate engine.
export async function acceptGraduation() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const offer = await getPendingGraduation(user.id)
  if (!offer) throw new Error('No hay oferta de graduación pendiente')

  await graduate(user.id, offer.targetTemplateCode)

  revalidatePath('/dashboard')
  revalidatePath('/plan')
}
