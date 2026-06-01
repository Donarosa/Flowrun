import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Cliente Supabase con service role para el admin. Bypassa RLS — la única
// barrera es el password gate en middleware. Server-only.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
