import Link from 'next/link'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { canChangePlan, listProPlans } from '@/lib/plan'
import { CambiarPlanForm } from './form'
import { ProPlansSection } from './pro-plans-section'

export default async function CambiarPlanPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const profile = data!.profile
  const check = await canChangePlan(user!.id)
  const proPlans = await listProPlans()

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-1 text-[13px] text-muted font-medium mb-4 hover:text-ink transition"
      >
        <span aria-hidden>←</span> Volver
      </Link>

      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-trail font-semibold mb-2">
        Cambiar mi plan
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-2">
        ¿Qué querés hacer ahora?
      </h1>
      <p className="text-[13px] text-muted mb-7">
        Al confirmar, tu plan actual se cancela y se genera uno nuevo desde
        hoy. Las sesiones marcadas se pierden.
      </p>

      {!check.allowed ? (
        <RateLimitBlock
          hoursRemaining={check.hoursRemaining ?? 24}
          nextAllowedAt={check.nextAllowedAt ?? null}
        />
      ) : (
        <>
          <CambiarPlanForm
            initialExperienceLevel={profile.experience_level}
            initialGoalType={profile.goal_type}
            initialWeeklyDays={profile.weekly_days}
          />
          <ProPlansSection plans={proPlans} />
        </>
      )}
    </main>
  )
}

function RateLimitBlock({
  hoursRemaining,
  nextAllowedAt,
}: {
  hoursRemaining: number
  nextAllowedAt: string | null
}) {
  return (
    <section className="bg-paper-2 rounded-3xl p-6 ring-1 ring-[var(--color-border)] text-center">
      <div className="w-12 h-12 rounded-2xl bg-terracotta-tint flex items-center justify-center mx-auto mb-4">
        <span className="text-xl">⏳</span>
      </div>
      <h2 className="text-lg font-extrabold tracking-tight text-ink mb-2">
        Cambiaste tu plan hace poco
      </h2>
      <p className="text-[13px] text-muted leading-relaxed mb-1">
        Podés volver a cambiarlo en{' '}
        <span className="font-bold text-terracotta-deep">
          {hoursRemaining} {hoursRemaining === 1 ? 'hora' : 'horas'}
        </span>
        .
      </p>
      {nextAllowedAt && (
        <p className="text-[12px] text-muted mb-5">
          Habilitado el {formatDateTime(nextAllowedAt)}.
        </p>
      )}
      <Link
        href="/perfil/editar"
        className="inline-flex items-center justify-center py-3 px-6 rounded-full bg-trail text-white font-semibold text-[14px] tracking-tight hover:bg-trail-deep transition"
      >
        Mientras tanto, editá tu perfil →
      </Link>
    </section>
  )
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm} a las ${hh}:${min}`
}
