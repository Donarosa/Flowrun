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

  // Raw fetch to Supabase REST to check key format issues
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const r = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    })
    result.raw_fetch = {
      status: r.status,
      statusText: r.statusText,
      body: (await r.text()).slice(0, 500),
      url_starts: url.slice(0, 20),
      key_starts: key.slice(0, 12),
      url_ends_clean: !url.endsWith('\n') && !url.endsWith(' '),
      key_ends_clean: !key.endsWith('\n') && !key.endsWith(' '),
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
