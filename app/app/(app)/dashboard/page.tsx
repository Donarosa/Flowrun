import Link from 'next/link'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { getTodaySession, type TodaySession } from '@/lib/plan'
import { getSubscription, getAccessState } from '@/lib/subscription'
import { TrialBanner } from '@/components/subscription/trial-banner'

export default async function DashboardPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const profile = data!.profile

  const session = await getTodaySession(user!.id)
  const subscription = await getSubscription(user!.id)
  const access = getAccessState(subscription)
  const greeting = profile.name?.split(' ')[0] || profile.email.split('@')[0]
  const noPlanYet = profile.experience_level === 'advanced'

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted font-semibold mb-2">
        Hoy
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink leading-tight mb-6">
        Hola, {greeting}.
      </h1>

      <TrialBanner access={access} />

      {session ? (
        <SessionCard session={session} />
      ) : noPlanYet ? (
        <EmptyState
          title="Tu plan avanzado está en camino"
          body="Los planes para nivel avanzado se sumarán pronto. Mientras tanto seguí tu rutina actual."
        />
      ) : (
        <EmptyState
          title="Hoy descansás"
          body="No tenés sesión programada. Hidratarte y caminar suave también suman."
        />
      )}
    </main>
  )
}

function SessionCard({ session }: { session: TodaySession }) {
  const done = session.status === 'completed'
  return (
    <Link
      href={`/sesion/${session.userSessionId}`}
      className="block bg-paper-2 rounded-3xl p-5 shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream transition"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-trail font-semibold">
          Semana {session.weekNumber}
        </span>
        {session.isDeload && (
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-stone font-semibold">
            · Descarga
          </span>
        )}
        {done && (
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-pine font-bold ml-auto">
            ✓ Hecha
          </span>
        )}
      </div>

      <h2 className="text-xl font-extrabold tracking-tight text-ink leading-tight mb-1">
        {session.name}
      </h2>
      <p className="text-[13px] text-muted mb-5">
        {session.totalDurationMin} minutos en total
      </p>

      <ul className="flex flex-col gap-2">
        {session.blocks.map((b, i) => (
          <li
            key={`${b.code}-${i}`}
            className="flex items-start gap-3 py-2.5 px-3 rounded-xl bg-cream"
          >
            <span className="font-mono text-[11px] tracking-[0.04em] text-trail font-bold w-10 shrink-0 pt-0.5">
              {b.code}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-ink leading-snug">
                {b.name}
              </div>
              {b.note && (
                <div className="text-[12px] text-muted leading-snug mt-0.5">
                  {b.note}
                </div>
              )}
            </div>
            <span className="text-[13px] font-semibold text-ink tabular-nums pt-0.5">
              {b.durationMin}′
            </span>
          </li>
        ))}
      </ul>
    </Link>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <article className="bg-paper-2 rounded-3xl p-6 shadow-[inset_0_0_0_1px_var(--color-border)]">
      <h2 className="text-lg font-extrabold tracking-tight text-ink mb-2">
        {title}
      </h2>
      <p className="text-[13px] text-muted leading-relaxed">{body}</p>
    </article>
  )
}
