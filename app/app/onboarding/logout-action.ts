'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Cierra la sesión y redirige a /login. Usado desde el banner de onboarding
// cuando el usuario detecta que entró con la cuenta Google equivocada.
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
