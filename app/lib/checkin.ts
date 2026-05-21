import { createClient } from '@/lib/supabase/server'
import type { SessionCheckinRow } from '@/types/database'

export async function getSessionCheckin(
  userSessionId: string
): Promise<SessionCheckinRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('session_checkins')
    .select('*')
    .eq('user_session_id', userSessionId)
    .maybeSingle<SessionCheckinRow>()
  return data
}
