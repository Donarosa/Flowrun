'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { canChangePlan, graduate, reassignPlan } from '@/lib/plan'
import type { ExperienceLevel, GoalType } from '@/types/database'

export type ChangePlanResult =
  | { ok: true }
  | { ok: false; error: string }

export async function changePlan(input: {
  experienceLevel: ExperienceLevel
  goalType: GoalType
  weeklyDays: number
}): Promise<ChangePlanResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No auth' }

  const check = await canChangePlan(user.id)
  if (!check.allowed) {
    const hours = check.hoursRemaining ?? 24
    return {
      ok: false,
      error: `Podés volver a cambiar el plan en ${hours} ${
        hours === 1 ? 'hora' : 'horas'
      }.`,
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      experience_level: input.experienceLevel,
      goal_type: input.goalType,
      weekly_days: input.weeklyDays,
    })
    .eq('id', user.id)
  if (error) return { ok: false, error: error.message }

  await reassignPlan(user.id)

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  revalidatePath('/perfil')
  redirect('/dashboard')
}

// Wrapper para uso desde un <form action={...}>. Lee el code del FormData
// y delega en selectProPlan. Hace redirect en éxito (no retorna).
export async function selectProPlanForm(formData: FormData): Promise<void> {
  const code = formData.get('code')
  if (typeof code !== 'string' || !code) {
    throw new Error('Falta el código del plan')
  }
  await selectProPlan(code)
}

// Selección directa de un plan pro por code. Salta el mapping de
// pickTemplateCode y materializa el target — el rate limit sigue aplicando
// (el usuario no debería poder oscilar entre planes cada 5 min).
export async function selectProPlan(code: string): Promise<ChangePlanResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No auth' }

  const check = await canChangePlan(user.id)
  if (!check.allowed) {
    const hours = check.hoursRemaining ?? 24
    return {
      ok: false,
      error: `Podés volver a cambiar el plan en ${hours} ${
        hours === 1 ? 'hora' : 'horas'
      }.`,
    }
  }

  await graduate(user.id, code)

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  revalidatePath('/perfil')
  redirect('/dashboard')
}
