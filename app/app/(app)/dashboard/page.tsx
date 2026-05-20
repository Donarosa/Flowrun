import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { LogoMark } from '@/components/brand/logo-mark'
import { LogoutButton } from '@/components/auth/logout-button'
import type { GoalType, ExperienceLevel } from '@/types/database'

const PISTA_LABEL: Record<`${ExperienceLevel}_${GoalType}`, string> = {
  new_calle: 'Empezar a correr (calle)',
  new_calle_trail: 'Empezar a correr (calle → trail)',
  new_trail: 'Empezar a correr (trail)',
  base_calle: 'Mejorar en calle',
  base_calle_trail: 'De la calle a la montaña',
  base_trail: 'Mejorar en trail',
  advanced_calle: 'Planes Avanzados (calle)',
  advanced_calle_trail: 'Planes Avanzados',
  advanced_trail: 'Planes Avanzados',
}

export default async function DashboardPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const { profile } = data!

  const greeting = profile.name?.split(' ')[0] || profile.email.split('@')[0]
  const pistaKey =
    `${profile.experience_level}_${profile.goal_type}` as keyof typeof PISTA_LABEL
  const pista = PISTA_LABEL[pistaKey] ?? '—'

  return (
    <div className="flex-1 flex flex-col bg-cream">
      <header className="flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2">
          <LogoMark className="w-7 h-7 text-trail" />
          <span className="font-semibold text-ink tracking-tight">
            flow<span className="text-trail">run</span>
          </span>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1 px-7 py-10 max-w-md mx-auto w-full">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted font-semibold mb-2">
          Dashboard
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink leading-tight mb-6">
          Hola, {greeting}.
        </h1>

        <div className="flex flex-col gap-3">
          <div className="bg-paper-2 rounded-2xl p-4 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted font-semibold mb-1.5">
              Tu pista
            </p>
            <p className="text-base font-semibold text-ink">{pista}</p>
          </div>

          <div className="bg-paper-2 rounded-2xl p-4 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted font-semibold mb-1.5">
              Días por semana
            </p>
            <p className="text-base font-semibold text-ink">
              {profile.weekly_days} días
            </p>
          </div>
        </div>

        <p className="text-muted text-[13px] leading-relaxed mt-8">
          El próximo paso: armar tu inbox de actividades, plan adaptativo y
          check-ins post-carrera.
        </p>
      </main>
    </div>
  )
}
