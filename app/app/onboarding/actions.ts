'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { assignPlan } from '@/lib/plan'
import type {
  ExperienceLevel,
  GoalType,
  PerceivedBase,
  EffortMode,
  Gender,
} from '@/types/database'

// P1 — Sobre vos (nombre, edad, país, género)
export async function setSobreVos(input: {
  name: string
  age: number
  country: string
  gender: Gender
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', user.id)
  if (error) throw new Error(error.message)

  redirect('/onboarding/pista')
}

// P2 — ¿Qué querés hacer?
// Pista directa: combina experience_level + goal_type en una sola pregunta.
export type PistaChoice =
  | 'zero'
  | 'street_to_trail'
  | 'improve_trail'
  | 'advanced'

const PISTA_MAP: Record<
  PistaChoice,
  { experience_level: ExperienceLevel; goal_type: GoalType | null }
> = {
  zero: { experience_level: 'new', goal_type: null }, // goal_type se define en P2a
  street_to_trail: { experience_level: 'base', goal_type: 'calle_trail' },
  improve_trail: { experience_level: 'base', goal_type: 'trail' },
  advanced: { experience_level: 'advanced', goal_type: 'trail' },
}

export async function setPista(choice: PistaChoice) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { experience_level, goal_type } = PISTA_MAP[choice]
  const { error } = await supabase
    .from('profiles')
    .update({ experience_level, goal_type })
    .eq('id', user.id)
  if (error) throw new Error(error.message)

  if (choice === 'zero') redirect('/onboarding/pista/destino')
  redirect('/onboarding/dias')
}

// P2a — ¿Dónde te imaginás corriendo? (solo si 'zero')
export type DestinoChoice = 'calle' | 'calle_trail'

export async function setDestino(choice: DestinoChoice) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({ goal_type: choice })
    .eq('id', user.id)
  if (error) throw new Error(error.message)

  redirect('/onboarding/dias')
}

// P3 — ¿Cuántos días?
export async function setDias(days: 2 | 3 | 4) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({ weekly_days: days })
    .eq('id', user.id)
  if (error) throw new Error(error.message)

  redirect('/onboarding/sensacion')
}

// P4 — Sensación actual (4 opciones UI → perceived_base + injury_history)
export type SensacionChoice =
  | 'tires_fast'
  | 'injury_prone'
  | 'always_strong'
  | 'no_enjoyment'

const SENSACION_MAP: Record<
  SensacionChoice,
  { perceived_base: PerceivedBase; injury_history: boolean }
> = {
  tires_fast: { perceived_base: 'low', injury_history: false },
  injury_prone: { perceived_base: 'medium', injury_history: true },
  always_strong: { perceived_base: 'solid', injury_history: false },
  no_enjoyment: { perceived_base: 'medium', injury_history: false },
}

export async function setSensacion(choice: SensacionChoice) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const update = SENSACION_MAP[choice]
  const { error } = await supabase
    .from('user_profile_metrics')
    .update(update)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  redirect('/onboarding/esfuerzo')
}

// P5 — Cómo medís esfuerzo
export async function setEsfuerzo(mode: EffortMode) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('user_profile_metrics')
    .update({ preferred_effort_mode: mode })
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  // Última pregunta del onboarding: asignar plan inicial.
  // assignPlan es idempotente — si ya hay plan activo, retorna sin tocar nada.
  await assignPlan(user.id)

  redirect('/dashboard')
}
