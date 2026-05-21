import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics, isOnboardingComplete } from '@/lib/profile'
import { LogoMark } from '@/components/brand/logo-mark'
import { TabBar } from '@/components/nav/tab-bar'

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser()
  if (!user) redirect('/login')

  const data = await getProfileWithMetrics(user.id)
  if (!isOnboardingComplete(data)) redirect('/onboarding/sobre-vos')

  return (
    <div className="flex-1 flex flex-col bg-cream min-h-screen">
      <header className="px-7 py-5 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <LogoMark className="w-7 h-7 text-trail" />
          <span className="font-semibold text-ink tracking-tight">
            flow<span className="text-trail">run</span>
          </span>
        </div>
      </header>

      <div className="flex-1 pb-24">{children}</div>

      <TabBar />
    </div>
  )
}
