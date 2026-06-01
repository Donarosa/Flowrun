import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Cliente de Supabase con service role. SOLO server-side, jamás expuesto
// al cliente. Bypassa RLS — usarlo únicamente en rutas internas con
// identidad verificada del lado del proveedor (ej. webhook con firma OK).
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
