import Link from 'next/link'
import { getUser } from '@/lib/supabase/get-user'
import { getPlanOverview, type PlanSessionSummary } from '@/lib/plan'
import { getSubscription, isLocked } from '@/lib/subscription'
import { PaywallBlock } from '@/components/subscription/paywall-block'

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  const day = DAYS_ES[d.getUTCDay()]
  const dayNum = d.getUTCDate()
  return `${day} ${dayNum}`
}

export default async function PlanPage() {
  const user = await getUser()
  const subscription = await getSubscription(user!.id)

  if (isLocked(subscription)) {
    return (
      <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted font-semibold mb-2">
          Plan
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink leading-tight mb-6">
          Tu plan está esperándote
        </h1>
        <PaywallBlock
          title="Acceso al plan completo"
          body="El plan adaptativo, las sesiones y los check-ins son parte de la suscripción. Tu plan se queda guardado para cuando vuelvas."
        />
      </main>
    )
  }

  const overview = await getPlanOverview(user!.id)

  if (!overview) {
    return (
      <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted font-semibold mb-2">
          Plan
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink leading-tight mb-6">
          Sin plan activo
        </h1>
        <p className="text-[13px] text-muted leading-relaxed">
          Todavía no tenés un plan asignado. Volvé al inicio y completá tu
          onboarding.
        </p>
      </main>
    )
  }

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted font-semibold mb-2">
        Plan
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-1">
        {overview.templateName}
      </h1>
      <p className="text-[13px] text-muted mb-7">
        {overview.totalWeeks} semanas · empezó {formatDate(overview.startedOn)}
      </p>

      <div className="flex flex-col gap-6">
        {overview.weeks.map((w) => (
          <section key={w.weekNumber}>
            <div className="flex items-baseline gap-2 mb-3 px-1">
              <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-trail font-bold">
                Semana {w.weekNumber}
              </h2>
              {w.hasDeload && (
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-stone font-semibold">
                  · Descarga
                </span>
              )}
            </div>

            <ul className="flex flex-col gap-2">
              {w.sessions.map((s) => (
                <SessionRow key={s.userSessionId} session={s} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

function SessionRow({ session }: { session: PlanSessionSummary }) {
  const tone = session.isToday
    ? 'bg-trail-tint shadow-[inset_0_0_0_2px_var(--color-trail)]'
    : session.isPast
      ? 'bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] opacity-70'
      : 'bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)]'

  const statusBadge =
    session.status === 'completed'
      ? '✓'
      : session.status === 'skipped'
        ? '·'
        : null

  const adapted = session.durationModifier !== 1
  const adaptedLabel = adapted
    ? `${session.durationModifier > 1 ? '+' : ''}${Math.round((session.durationModifier - 1) * 100)}%`
    : null
  const isSkipped = session.status === 'skipped'

  return (
    <li>
      <Link
        href={`/sesion/${session.userSessionId}`}
        className={`block rounded-2xl p-4 flex items-start gap-3 transition hover:brightness-[0.98] ${tone}`}
      >
        <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted font-semibold w-[44px] shrink-0 pt-0.5">
          {formatDate(session.scheduledDate)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-ink leading-snug mb-1">
            {session.sessionName}
            {isSkipped && (
              <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.08em] text-stone">
                · saltada
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="font-mono font-semibold text-trail">
              {session.blockCodes.join(' · ')}
            </span>
            <span>·</span>
            <span className="tabular-nums">{session.totalDurationMin}′</span>
            {adapted && (
              <>
                <span>·</span>
                <span className="font-mono font-bold text-terracotta-deep">
                  {adaptedLabel}
                </span>
              </>
            )}
          </div>
        </div>
        {statusBadge && (
          <span className="font-mono text-[14px] font-bold text-pine pt-0.5">
            {statusBadge}
          </span>
        )}
      </Link>
    </li>
  )
}
