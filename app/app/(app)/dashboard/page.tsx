import Link from 'next/link'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { getTodaySession, type TodaySession } from '@/lib/plan'
import { getSubscription, getAccessState } from '@/lib/subscription'
import { getLatestAdaptation } from '@/lib/adaptation'
import { getPendingGraduation } from '@/lib/gate'
import { getWeeklySummary, type WeeklySummary } from '@/lib/weekly'
import { TrialBanner } from '@/components/subscription/trial-banner'
import { AdaptationBanner } from '@/components/adaptation/adaptation-banner'
import { GraduationBanner } from '@/components/adaptation/graduation-banner'

const DAYS_LONG = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

function todayKicker(): string {
  const d = new Date()
  return `${DAYS_LONG[d.getDay()]} ${d.getDate()}`
}

export default async function DashboardPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const profile = data!.profile

  const session = await getTodaySession(user!.id)
  const subscription = await getSubscription(user!.id)
  const access = getAccessState(subscription)
  const adaptation = await getLatestAdaptation(user!.id)
  const graduation = await getPendingGraduation(user!.id)
  const weekly = await getWeeklySummary(user!.id)

  const greeting = profile.name?.split(' ')[0] || profile.email.split('@')[0]
  const noPlanYet = profile.experience_level === 'advanced'

  return (
    <main className="px-6 pt-1 pb-8 max-w-md mx-auto w-full">
      <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-trail font-semibold mb-2 flex items-center gap-2.5">
        <span aria-hidden className="w-[18px] h-[1.5px] bg-trail rounded-[1px]" />
        Hoy · {todayKicker()}
      </p>
      <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-ink leading-[1.08] mb-[22px]">
        Hola, <span className="text-trail">{greeting}</span>
        <span className="text-trail">.</span>
      </h1>

      <TrialBanner access={access} />
      {graduation ? (
        <GraduationBanner offer={graduation} />
      ) : (
        <AdaptationBanner log={adaptation} />
      )}

      {session ? (
        <SessionCard session={session} />
      ) : noPlanYet ? (
        <RestCard
          kicker="En preparación"
          title="Tu plan avanzado está en camino"
          body="Los planes para nivel avanzado se sumarán pronto. Mientras tanto seguí tu rutina actual."
        />
      ) : (
        <>
          <RestCard
            kicker="Día de descanso"
            title="Hoy descansás"
            body={
              <>
                No tenés sesión programada.{' '}
                <strong className="text-ink font-semibold">
                  Hidratarte y caminar suave también suman.
                </strong>
              </>
            }
          />
          <Suggestions />
        </>
      )}

      {weekly && <WeekStrip summary={weekly} />}
    </main>
  )
}

function SessionCard({ session }: { session: TodaySession }) {
  const done = session.status === 'completed'
  const adapted = session.durationModifier !== 1
  const adaptedLabel = adapted
    ? `${session.durationModifier > 1 ? '+' : ''}${Math.round((session.durationModifier - 1) * 100)}%`
    : null

  return (
    <Link
      href={`/sesion/${session.userSessionId}`}
      className="block bg-paper-2 rounded-[16px] p-[18px] mb-3.5 border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] relative overflow-hidden hover:brightness-[0.99] transition"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-5 w-[90px] h-[90px] rounded-full bg-trail-tint"
      />
      <div className="relative z-[1]">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-trail font-bold">
            Semana {session.weekNumber} · Sesión
          </span>
          {session.isDeload && (
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-stone font-semibold">
              · Descarga
            </span>
          )}
          {adapted && (
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-terracotta-deep font-bold">
              · Ajustada {adaptedLabel}
            </span>
          )}
          {done && (
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-pine font-bold ml-auto">
              ✓ Hecha
            </span>
          )}
        </div>

        <h2 className="text-[17px] font-semibold tracking-[-0.022em] text-ink leading-[1.2] mb-1">
          {session.name}
        </h2>
        <p className="text-[12.5px] text-muted leading-[1.45] tracking-[-0.005em] mb-3.5">
          {session.distanceLabel
            ? `${session.distanceLabel} · ~${session.totalDurationMin} min`
            : `${session.totalDurationMin} minutos en total`}
        </p>

        <ul className="flex flex-col gap-1.5">
          {session.blocks.map((b, i) => (
            <li
              key={`${b.code}-${i}`}
              className="grid grid-cols-[44px_1fr_auto] gap-2.5 items-center py-2 px-2.5 rounded-[10px] bg-cream"
            >
              <span className="font-mono text-[11px] tracking-[0.04em] text-trail font-bold">
                {b.code}
              </span>
              <span className="text-[12.5px] font-medium text-ink tracking-[-0.008em] truncate">
                {b.name}
              </span>
              <span className="font-mono text-[12px] font-bold text-ink tracking-[0.02em] tabular-nums">
                {b.durationMin}′
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  )
}

type RestCardProps = {
  kicker: string
  title: string
  body: React.ReactNode
}

function RestCard({ kicker, title, body }: RestCardProps) {
  return (
    <article className="bg-paper-2 border border-border rounded-[16px] p-[18px] mb-3.5 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-5 w-[90px] h-[90px] rounded-full bg-trail-tint"
      />
      <div className="relative z-[1] flex items-center gap-[11px] mb-3.5">
        <span className="w-[38px] h-[38px] rounded-[11px] bg-lichen text-trail flex items-center justify-center shrink-0">
          <MoonIcon />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted font-bold mb-[3px]">
            {kicker}
          </p>
          <h2 className="text-[17px] font-semibold tracking-[-0.022em] text-ink leading-[1.2]">
            {title}
          </h2>
        </div>
      </div>
      <p className="relative z-[1] text-[13px] text-muted leading-[1.5] tracking-[-0.005em]">
        {body}
      </p>
    </article>
  )
}

function Suggestions() {
  const items = [
    { title: 'Caminata 30 min', meta: 'Z1 · suave' },
    { title: 'Movilidad de cadera', meta: '10 min · video' },
    { title: 'Hidratar + sales', meta: '2L · electrolitos' },
  ]
  return (
    <section className="mt-[18px]">
      <h3 className="font-mono text-[10px] tracking-[0.18em] uppercase text-trail font-bold mb-2.5 flex items-center gap-2.5">
        <span aria-hidden className="w-[18px] h-[1.5px] bg-trail rounded-[1px]" />
        Para hoy
      </h3>
      <ul className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <li
            key={it.title}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-paper-2 border border-border rounded-[13px] px-3.5 py-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
          >
            <span className="font-mono text-[10.5px] text-trail font-bold tracking-[0.06em] min-w-[18px]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-ink tracking-[-0.012em] leading-[1.25] truncate">
                {it.title}
              </div>
              <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted font-semibold mt-[3px]">
                {it.meta}
              </div>
            </div>
            <span aria-hidden className="font-mono text-[14px] text-soft">
              ›
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function WeekStrip({ summary }: { summary: WeeklySummary }) {
  return (
    <section className="mt-[18px] bg-paper-2 border border-border rounded-[13px] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
      <div className="flex justify-between items-center mb-2.5">
        <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-trail font-bold">
          Resumen sem {summary.weekNumber || '—'}
        </span>
        <span className="font-mono text-[9px] tracking-[0.1em] text-muted font-medium">
          {summary.rangeLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Cell value={`${summary.volumeMin}′`} label="Volumen" />
        <Cell
          value={summary.rpeAvg != null ? summary.rpeAvg.toFixed(1) : '—'}
          label="RPE medio"
        />
        <Cell
          value={summary.easyPct != null ? `${summary.easyPct}%` : '—'}
          label="Z1—Z2"
        />
      </div>
    </section>
  )
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-[16px] font-bold text-ink tracking-[0.01em] tabular-nums leading-none">
        {value}
      </div>
      <div className="font-mono text-[8.5px] tracking-[0.16em] uppercase text-muted font-semibold mt-1.5">
        {label}
      </div>
    </div>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
