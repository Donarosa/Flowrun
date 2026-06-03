import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Cron diario: borra perfiles huérfanos (sin onboarding completado, sin plan,
// sin T&C aceptados, > 7 días viejos). Llamado por Vercel Cron via vercel.json.
//
// Auth: Vercel inyecta `Authorization: Bearer ${CRON_SECRET}` automáticamente
// si configurás la env var en el proyecto. Validamos para que nadie más
// pueda dispararlo.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supa = createAdminClient()
  const untypedSupa = supa as unknown as {
    rpc: (fn: string) => Promise<{
      data: unknown
      error: { message: string } | null
    }>
  }
  const { data, error } = await untypedSupa.rpc('cleanup_orphan_profiles')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const arr = Array.isArray(data) ? (data as unknown[]) : []
  return NextResponse.json({
    ok: true,
    deletedCount: arr.length,
    deleted: arr,
  })
}
