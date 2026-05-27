import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics, isOnboardingComplete } from '@/lib/profile'
import { LogoMark } from '@/components/brand/logo-mark'
import { TabBar } from '@/components/nav/tab-bar'
import { SupportChat } from '@/components/support/support-chat'

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser()
  if (!user) redirect('/login')

  const data = await getProfileWithMetrics(user.id)
  if (!isOnboardingComplete(data)) redirect('/onboarding/sobre-vos')

  return (
    <div className="flex-1 flex flex-col bg-cream min-h-screen">
      <header className="px-6 pt-4 pb-3 max-w-md mx-auto w-full">
        <div className="flex items-center gap-[9px]">
          <LogoMark className="w-[30px] h-[30px] text-trail" />
          <span className="text-[18px] font-semibold tracking-[-0.03em] text-ink lowercase">
            flow<span className="text-trail">run</span>
          </span>
        </div>
      </header>

      <div className="flex-1 pb-24">{children}</div>

      <TabBar />
      <SupportChat />
    </div>
  )
}
