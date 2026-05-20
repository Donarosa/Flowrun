import { createClient } from '@/lib/supabase/server'

// Use in Server Components, Server Actions and Route Handlers.
// Returns the authenticated user or null.
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
