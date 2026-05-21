'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  EffortMode,
  Gender,
  PerceivedBase,
} from '@/types/database'

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string }

// Edita datos personales y preferencias del usuario. NO toca pista/días/plan
// — eso vive en /perfil/cambiar-plan.
export async function updateProfile(input: {
  name: string
  age: number
  country: string
  gender: Gender
  perceivedBase: PerceivedBase
  effortMode: EffortMode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      name: input.name.trim(),
      age: input.age,
      country: input.country,
      gender: input.gender,
    })
    .eq('id', user.id)
  if (profileErr) throw new Error(profileErr.message)

  const { error: metricsErr } = await supabase
    .from('user_profile_metrics')
    .update({
      perceived_base: input.perceivedBase,
      preferred_effort_mode: input.effortMode,
    })
    .eq('user_id', user.id)
  if (metricsErr) throw new Error(metricsErr.message)

  revalidatePath('/perfil')
  revalidatePath('/perfil/editar')
  redirect('/perfil')
}
