import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics, isOnboardingComplete } from '@/lib/profile'

export default async function RootPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const data = await getProfileWithMetrics(user.id)
  redirect(isOnboardingComplete(data) ? '/dashboard' : '/onboarding/sobre-vos')
}
