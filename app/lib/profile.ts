import { createClient } from '@/lib/supabase/server'
import type { Profile, ProfileMetrics } from '@/types/database'

export type ProfileWithMetrics = {
  profile: Profile
  metrics: ProfileMetrics
}

// Fetch both rows for the authenticated user. Returns null if either is missing.
export async function getProfileWithMetrics(
  userId: string
): Promise<ProfileWithMetrics | null> {
  const supabase = await createClient()

  const [{ data: profile }, { data: metrics }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('user_profile_metrics')
      .select('*')
      .eq('user_id', userId)
      .single(),
  ])

  if (!profile || !metrics) return null
  return { profile, metrics }
}

// Onboarding is complete when all the required answers are persisted.
export function isOnboardingComplete(data: ProfileWithMetrics | null): boolean {
  if (!data) return false
  const { profile, metrics } = data
  return Boolean(
    profile.name &&
      profile.age &&
      profile.gender &&
      profile.country &&
      profile.experience_level &&
      profile.goal_type &&
      profile.weekly_days &&
      metrics.perceived_base &&
      metrics.preferred_effort_mode
  )
}
