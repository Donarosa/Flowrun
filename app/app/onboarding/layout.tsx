import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics, isOnboardingComplete } from '@/lib/profile'
import { signOutAction } from './logout-action'

export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser()
  if (!user) redirect('/login')

  const data = await getProfileWithMetrics(user.id)
  if (isOnboardingComplete(data)) redirect('/dashboard')

  return (
    <div className="flex-1 flex flex-col bg-cream max-w-md mx-auto w-full">
      <div className="px-6 pt-3 pb-1">
        <div className="flex items-center justify-between gap-2 bg-paper-2 border border-border rounded-[10px] px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted font-semibold leading-tight">
              Conectado como
            </p>
            <p className="text-[12px] text-ink font-medium truncate leading-tight mt-0.5">
              {user.email}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-[11px] font-mono text-muted hover:text-ink font-semibold tracking-[0.04em] whitespace-nowrap px-2 py-1 rounded hover:bg-cream transition"
            >
              No soy yo
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  )
}
