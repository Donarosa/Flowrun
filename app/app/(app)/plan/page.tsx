import Link from 'next/link'
import { getUser } from '@/lib/supabase/get-user'
import { getPlanOverview, type PlanSessionSummary } from '@/lib/plan'
import { getSubscription, isLocked } from '@/lib/subscription'
import { PaywallBlock } from '@/components/subscription/paywall-block'

const DAY_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function dayParts(iso: string): { label: string; num: number } {
  const d = new Date(`${iso}T00:00:00Z`)
  return { label: DAY_ABBR[d.getUTCDay()], num: d.getUTCDate() }
}

export default async function PlanPage() {
  const user = await getUser()
  const subscription = await getSubscription(user!.id)

  if (isLocked(subscription)) {
    return (
      <main className="px-6 pt-1 pb-8 max-w-md mx-auto w-full">
        <PageKicker>Plan</PageKicker>
        <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-ink leading-[1.08] mb-1.5 text-balance">
          Tu plan está esperándote
        </h1>
        <p className="text-[12.5px] text-muted leading-[1.45] mb-5">
          El plan adaptativo se guarda hasta que vuelvas.
        </p>
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
      <main className="px-6 pt-1 pb-8 max-w-md mx-auto w-full">
        <PageKicker>Plan</PageKicker>
        <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-ink leading-[1.08] mb-1.5 text-balance">
          Sin plan activo
        </h1>
        <p className="text-[12.5px] text-muted leading-[1.45]">
          Todavía no tenés un plan asignado. Volvé al inicio y completá tu
          onboarding.
        </p>
      </main>
    )
  }

  const allSessions = overview.weeks.flatMap((w) => w.sessions)
  const totalSessions = allSessions.length
  const doneCount = allSessions.filter((s) => s.status === 'completed').length
  const currentWeek =
    overview.weeks.find((w) =>
      w.sessions.some((s) => s.isToday || (!s.isPast && s.status !== 'completed'))
    )?.weekNumber ?? overview.weeks[overview.weeks.length - 1].weekNumber
  const progressPct = totalSessions
    ? Math.round((doneCount / totalSessions) * 100)
    : 0

  const nextSessionId = allSessions.find((s) => s.status !== 'completed')
    ?.userSessionId

  return (
    <main className="px-6 pt-1 pb-8 max-w-md mx-auto w-full">
      <div className="relative overflow-hidden rounded-[18px] text-white mb-5 px-[26px] py-[18px] bg-gradient-to-br from-trail to-trail-deep">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-6 w-40 h-40 rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,255,255,0.13), transparent 60%)',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-[30px] -bottom-10 w-[120px] h-[120px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,255,255,0.08), transparent 60%)',
          }}
        />
        <p className="relative z-[1] font-mono text-[9px] tracking-[0.2em] uppercase text-white/75 font-semibold mb-1.5">
          Plan · activo
        </p>
        <h1 className="relative z-[1] text-[20px] font-semibold tracking-[-0.026em] leading-[1.15] mb-3.5 text-balance">
          {overview.templateName}
        </h1>
        <div className="relative z-[1] flex gap-[18px] font-mono text-[9.5px] text-white/80 tracking-[0.04em] mb-3">
          <Stat value={overview.totalWeeks} label="semanas" />
          <Stat value={totalSessions} label="sesiones" />
          <Stat value={doneCount} label="hechas" />
        </div>
        <div className="relative z-[1] flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/75 font-semibold">
          <span>Sem {currentWeek}</span>
          <div className="flex-1 h-[3px] bg-white/[0.18] rounded-[2px] overflow-hidden">
            <div
              className="h-full bg-white rounded-[2px]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span>{progressPct}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {overview.weeks.map((w) => {
          const weekTotal = w.sessions.reduce(
            (acc, s) => acc + s.totalDurationMin,
            0
          )
          return (
            <section key={w.weekNumber}>
              <div className="flex justify-between items-center font-mono text-[10px] tracking-[0.18em] uppercase mb-2 px-0.5">
                <span className="text-trail font-bold">
                  Semana {w.weekNumber}
                  {w.hasDeload && (
                    <span className="ml-2 text-stone font-semibold tracking-[0.14em] normal-case">
                      · Descarga
                    </span>
                  )}
                </span>
                <span className="text-muted font-medium tracking-[0.06em] normal-case">
                  {weekTotal}′ total
                </span>
              </div>

              <ul className="flex flex-col gap-[7px]">
                {w.sessions.map((s) => (
                  <SessionRow
                    key={s.userSessionId}
                    session={s}
                    isNext={s.userSessionId === nextSessionId}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </main>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col gap-[3px]">
      <strong className="text-white font-bold text-[16px] tracking-[0.01em] tabular-nums">
        {value}
      </strong>
      {label}
    </span>
  )
}

function PageKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-trail font-semibold mb-2 flex items-center gap-2.5">
      <span aria-hidden className="w-[18px] h-[1.5px] bg-trail rounded-[1px]" />
      {children}
    </p>
  )
}

type SessionRowProps = {
  session: PlanSessionSummary
  isNext: boolean
}

function SessionRow({ session, isNext }: SessionRowProps) {
  const done = session.status === 'completed'
  const skipped = session.status === 'skipped'
  const { label: dayLabel, num: dayNum } = dayParts(session.scheduledDate)

  const wrapClass = done
    ? 'bg-gradient-to-r from-trail-tint to-paper-2 border-trail/80'
    : isNext
      ? 'bg-paper-2 border-trail shadow-[0_0_0_3px_var(--color-trail-tint),inset_0_1px_0_rgba(255,255,255,0.5)]'
      : 'bg-paper-2 border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'

  const chipClass = done || isNext ? 'bg-trail text-white' : 'bg-lichen text-trail'

  const adapted = session.durationModifier !== 1
  const adaptedLabel = adapted
    ? `${session.durationModifier > 1 ? '+' : ''}${Math.round((session.durationModifier - 1) * 100)}%`
    : null

  return (
    <li>
      <Link
        href={`/sesion/${session.userSessionId}`}
        className={`grid grid-cols-[auto_1fr_auto] items-center gap-[11px] rounded-[14px] border px-[13px] py-[11px] transition hover:brightness-[0.99] ${wrapClass}`}
      >
        <div
          className={`flex flex-col items-center justify-center font-mono rounded-[10px] px-[9px] py-[7px] min-w-[44px] ${chipClass}`}
        >
          <span className="text-[7.5px] tracking-[0.18em] uppercase opacity-85 font-semibold mb-[2px]">
            {dayLabel}
          </span>
          <span className="text-[15px] font-bold tracking-[0.02em] leading-none">
            {dayNum}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-ink tracking-[-0.014em] leading-[1.25] truncate">
            {session.sessionName}
            {skipped && (
              <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.08em] text-stone font-semibold">
                · saltada
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-[5px] mt-[5px] items-center">
            {session.blockCodes.map((c) => (
              <span
                key={c}
                className={`font-mono text-[8.5px] tracking-[0.1em] uppercase font-semibold px-[6px] py-[2.5px] rounded-[4px] border ${
                  done
                    ? 'bg-white/70 text-trail border-transparent'
                    : 'bg-cream text-muted border-hair'
                }`}
              >
                {c}
              </span>
            ))}
            <span
              className={`font-mono text-[8.5px] tracking-[0.1em] uppercase font-semibold px-[6px] py-[2.5px] rounded-[4px] border ${
                done
                  ? 'bg-white/70 text-trail border-transparent'
                  : 'bg-lichen text-trail border-transparent'
              }`}
            >
              {session.totalDurationMin}′
            </span>
            {adapted && (
              <span className="font-mono text-[8.5px] tracking-[0.1em] uppercase font-bold text-terracotta-deep">
                {adaptedLabel}
              </span>
            )}
          </div>
        </div>
        <div
          className={`w-[26px] h-[26px] rounded-full flex items-center justify-center font-mono text-[12px] font-semibold border-[1.5px] ${
            done
              ? 'bg-trail border-trail text-white'
              : isNext
                ? 'bg-paper-2 border-trail text-trail'
                : 'bg-paper-2 border-border text-soft'
          }`}
          aria-hidden
        >
          {done ? '✓' : isNext ? '→' : '○'}
        </div>
      </Link>
    </li>
  )
}
