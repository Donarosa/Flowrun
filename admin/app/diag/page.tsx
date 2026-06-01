import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function DiagPage() {
  const envUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminPw = !!process.env.ADMIN_PASSWORD

  const result: Record<string, unknown> = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: envUrl,
      SUPABASE_SERVICE_ROLE_KEY: envKey,
      ADMIN_PASSWORD: adminPw,
      url_length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0,
      key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
    },
  }

  try {
    const supa = createAdminClient()

    try {
      const r = await supa
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      result.profiles_count = { count: r.count, error: r.error?.message ?? null, status: r.status }
    } catch (e) {
      result.profiles_count_threw = String(e)
    }

    try {
      const r = await supa.from('subscriptions').select('status').limit(1)
      result.subs_sample = {
        data: r.data,
        error: r.error?.message ?? null,
        status: r.status,
      }
    } catch (e) {
      result.subs_sample_threw = String(e)
    }

    try {
      const r = await supa
        .from('user_sessions')
        .select('user_plans!inner(user_id)')
        .eq('status', 'completed')
        .limit(1)
      result.nested_select = {
        data: r.data,
        error: r.error?.message ?? null,
      }
    } catch (e) {
      result.nested_select_threw = String(e)
    }
  } catch (e) {
    result.client_creation_threw = String(e)
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/+$/, '')
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
    const tries: Array<{
      label: string
      target: string
      status?: number
      body?: string
    }> = []
    for (const path of [
      '/rest/v1/profiles?select=id&limit=1',
      '/rest/v1/?apikey=',
      '/auth/v1/health',
    ]) {
      const target = `${url}${path}`
      try {
        const r = await fetch(target, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          cache: 'no-store',
        })
        tries.push({
          label: path,
          target: target.replace(url, '<URL>'),
          status: r.status,
          body: (await r.text()).slice(0, 240),
        })
      } catch (e) {
        tries.push({ label: path, target, body: `THREW: ${e}` })
      }
    }
    result.raw_fetch = {
      url_chars: process.env.NEXT_PUBLIC_SUPABASE_URL!.length,
      url_cleaned_chars: url.length,
      url_host: url.replace(/^https?:\/\//, '').split('.')[0],
      key_starts: key.slice(0, 12),
      key_chars: key.length,
      tries,
    }
  } catch (e) {
    result.raw_fetch_threw = String(e)
  }

  return (
    <pre className="text-[12px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 overflow-x-auto">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}
