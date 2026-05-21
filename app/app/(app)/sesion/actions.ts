'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  revalidatePath(`/sesion/${userSessionId}`)
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
