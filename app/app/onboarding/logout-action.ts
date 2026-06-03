'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Cierra sesión y vuelve al login. Lo usa el banner "No soy yo" del
// onboarding cuando el usuario detecta que entró con la cuenta de Google
// equivocada.
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
