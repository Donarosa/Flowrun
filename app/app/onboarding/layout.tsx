import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics, isOnboardingComplete } from '@/lib/profile'

export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser()
  if (!user) redirect('/login')

  const data = await getProfileWithMetrics(user.id)
  if (isOnboardingComplete(data)) redirect('/dashboard')

  return (
    <div className="flex-1 flex flex-col bg-cream max-w-md mx-auto w-full">
      {children}
    </div>
  )
}
