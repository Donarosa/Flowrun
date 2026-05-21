'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { runWeeklyAdaptationIfNeeded } from '@/lib/adaptation'
import type {
  BreathingLevel,
  LegsFatigueLevel,
  SessionIntent,
  TalkTestLevel,
} from '@/types/database'

// Marca una user_session como completada. RLS valida ownership.
export async function markSessionDone(userSessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const { error } = await supabase
    .from('user_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', userSessionId)
  if (error) throw new Error(error.message)

  await runWeeklyAdaptationIfNeeded(userSessionId)

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  revalidatePath(`/sesion/${userSessionId}`)
}

// Guarda el check-in (upsert) y marca la sesión como completada en una sola
// operación lógica. RLS valida ownership a través de los enlaces user_session
// → user_plan → user_id.
export async function saveCheckin(input: {
  userSessionId: string
  rpe: number
  talkTest: TalkTestLevel
  breathing: BreathingLevel
  intent: SessionIntent
  pain: boolean
  legsFatigue: LegsFatigueLevel
  notes?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const { error: checkinError } = await supabase
    .from('session_checkins')
    .upsert(
      {
        user_session_id: input.userSessionId,
        rpe: input.rpe,
        talk_test: input.talkTest,
        breathing: input.breathing,
        intent: input.intent,
        pain: input.pain,
        legs_fatigue: input.legsFatigue,
        notes: input.notes?.trim() ? input.notes.trim() : null,
      },
      { onConflict: 'user_session_id' }
    )
  if (checkinError) throw new Error(checkinError.message)

  const { error: sessionError } = await supabase
    .from('user_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', input.userSessionId)
  if (sessionError) throw new Error(sessionError.message)

  await runWeeklyAdaptationIfNeeded(input.userSessionId)

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  revalidatePath(`/sesion/${input.userSessionId}`)
  redirect(`/sesion/${input.userSessionId}`)
}

// Vuelve una sesión a pending (deshacer).
export async function markSessionPending(userSessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const { error } = await supabase
    .from('user_sessions')
    .update({
      status: 'pending',
      completed_at: null,
    })
    .eq('id', userSessionId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  revalidatePath(`/sesion/${userSessionId}`)
}
