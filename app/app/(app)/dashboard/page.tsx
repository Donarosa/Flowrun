import Link from 'next/link'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import {
  getTodaySession,
  getPlanProgress,
  type TodaySession,
  type PlanProgress,
} from '@/lib/plan'
import { getSubscription, getAccessState, isLocked } from '@/lib/subscription'
import { getLatestAdaptation } from '@/lib/adaptation'
import { getPendingGraduation } from '@/lib/gate'
import { getWeeklySummary, type WeeklySummary } from '@/lib/weekly'
import { TrialBanner } from '@/components/subscription/trial-banner'
import { AdaptationBanner } from '@/components/adaptation/adaptation-banner'
import { GraduationBanner } from '@/components/adaptation/graduation-banner'
import { PaywallBlock } from '@/components/subscription/paywall-block'
import {
  buildSteps,
  displayTitle,
  whyFor,
  categoryLabel,
  primaryCategory,
} from '@/lib/session-presentation'

const DAYS_LONG = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
]

function todayKicker(): string {
  const d = new Date()
  return `${DAYS_LONG[d.getDay()]} ${d.getDate()}`
}

export default async function DashboardPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const profile = data!.profile
  const greeting = profile.name?.split(' ')[0] || profile.email.split('@')[0]

  const subscription = await getSubscription(user!.id)

  if (isLocked(subscription)) {
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
        <PaywallBlock
          title="Tu acceso a FlowRun terminó"
          body="Suscribite y arrancás de nuevo donde dejaste. Tu plan adaptativo te espera."
        />
      </main>
    )
  }

  const session = await getTodaySession(user!.id)
  const access = getAccessState(subscription)
  const adaptation = await getLatestAdaptation(user!.id)
  const graduation = await getPendingGraduation(user!.id)
  const weekly = await getWeeklySummary(user!.id)
  const planProgress = await getPlanProgress(user!.id)

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
        <SessionToday session={session} />
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
      {planProgress && <PlanBar progress={planProgress} />}
    </main>
  )
}

function SessionToday({ session }: { session: TodaySession }) {
  const title = displayTitle(session.name)
  const why = whyFor(session.blocks)
  const cat = primaryCategory(session.blocks)
  const adapted = session.durationModifier !== 1
  const adaptedLabel = adapted
    ? `${session.durationModifier > 1 ? '+' : ''}${Math.round((session.durationModifier - 1) * 100)}%`
    : null

  // Build top-level stepper for preview (titles + durations only).
  const steps = buildSteps({
    userSessionId: session.userSessionId,
    status: session.status,
    scheduledDate: session.scheduledDate,
    completedAt: null,
    name: session.name,
    isDeload: session.isDeload,
    weekNumber: session.weekNumber,
    totalDurationMin: session.totalDurationMin,
    durationModifier: session.durationModifier,
    adaptationNote: session.adaptationNote,
    distanceLabel: session.distanceLabel,
    blocks: session.blocks.map((b) => ({
      code: b.code,
      name: b.name,
      description: null,
      durationMin: b.durationMin,
      note: b.note,
    })),
  })

  const totalReps = steps.reduce((sum, s) => sum + (s.repeats?.reps ?? 0), 0)
  const showReps = totalReps > 0
  const done = session.status === 'completed'

  return (
    <>
      {/* Hero — estilo white card */}
      <article className="relative overflow-hidden bg-paper-2 border border-border rounded-[16px] p-[18px] mb-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
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

          <h2 className="text-[22px] font-bold tracking-[-0.028em] text-ink leading-[1.1] mb-1.5">
            {title}
          </h2>
          <p className="text-[12.5px] text-muted leading-[1.45] tracking-[-0.005em] mb-3.5 max-w-[255px]">
            {why.body}
          </p>

          <div className="flex gap-5">
            <Fact value={`${session.totalDurationMin}′`} label="Duración" />
            <Fact value={steps.length} label="Pasos" />
            {showReps ? (
              <Fact value={totalReps} label="Repeticiones" />
            ) : (
              <Fact value={categoryLabel(cat)} label="Tipo" />
            )}
          </div>
        </div>
      </article>

      {!done && (
        <Link
          href={`/sesion/${session.userSessionId}`}
          className="flex items-center justify-between gap-2 w-full bg-paper-2 text-trail-deep rounded-[14px] pl-[18px] pr-2 min-h-[52px] mb-6 font-semibold text-[14.5px] tracking-[-0.005em] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(20,30,20,0.08)] hover:brightness-[0.99] transition"
        >
          <span>Empezar sesión</span>
          <span aria-hidden className="font-mono w-[34px] h-[34px] rounded-[11px] bg-trail text-white flex items-center justify-center text-[15px]">
            →
          </span>
        </Link>
      )}

      {/* Block label header */}
      <div className="font-mono text-[11px] text-trail tracking-[0.2em] uppercase font-semibold flex items-center gap-2.5 mb-3.5">
        <span aria-hidden className="w-[22px] h-[1.5px] bg-trail rounded-[1px]" />
        <span>El entrenamiento</span>
        <span className="ml-auto font-mono text-[9.5px] text-soft tracking-[0.1em] font-medium normal-case">
          {steps.length} pasos
        </span>
      </div>

      {/* Stepper compacto */}
      <ol className="mb-6">
        {steps.map((step, i) => (
          <CompactStep
            key={`${step.name}-${i}`}
            step={step}
            num={i + 1}
            isLast={i === steps.length - 1}
          />
        ))}
      </ol>
    </>
  )
}

function Fact({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[17px] font-bold tracking-[0.01em] leading-none text-ink tabular-nums">
        {value}
      </span>
      <span className="font-mono text-[8.5px] tracking-[0.14em] uppercase font-semibold text-muted">
        {label}
      </span>
    </div>
  )
}

function CompactStep({
  step,
  num,
  isLast,
}: {
  step: { kind: 'warm' | 'work' | 'cool'; name: string; duration: string }
  num: number
  isLast: boolean
}) {
  const isWork = step.kind === 'work'
  const nodeClass = isWork
    ? 'border-trail bg-trail text-white shadow-[0_0_0_4px_var(--color-trail-tint)]'
    : 'border-border bg-paper-2 text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'

  return (
    <li className="grid grid-cols-[34px_1fr] gap-3.5 relative">
      <div className="flex flex-col items-center">
        <div
          className={`w-[34px] h-[34px] rounded-[11px] border flex items-center justify-center font-mono text-[13px] font-bold shrink-0 ${nodeClass}`}
        >
          {num}
        </div>
        {!isLast && <div className="flex-1 w-[1.5px] bg-hair my-[3px]" />}
      </div>
      <div
        className={`flex items-center justify-between gap-2.5 min-w-0 pb-[26px] pt-1 ${isLast ? '' : 'border-b border-hair mb-[2px]'}`}
      >
        <div className="min-w-0">
          <div className="text-[17px] font-semibold text-ink tracking-[-0.022em] leading-[1.12] truncate">
            {step.name}
          </div>
        </div>
        <span className="font-mono text-[12px] text-muted font-bold tracking-[0.02em] whitespace-nowrap shrink-0">
          {step.duration}
        </span>
      </div>
    </li>
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
            <span aria-hidden className="font-mono text-[14px] text-soft">›</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function WeekStrip({ summary }: { summary: WeeklySummary }) {
  const pct =
    summary.sessionsTotal > 0
      ? (summary.sessionsCompleted / summary.sessionsTotal) * 100
      : 0
  return (
    <section className="bg-paper-2 border border-border rounded-[16px] px-4 py-3.5 mt-2 mb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
      <div className="flex justify-between items-baseline mb-3">
        <span className="font-mono text-[10px] font-semibold tracking-[0.16em] uppercase text-trail">
          Resumen sem {summary.weekNumber || '—'}
        </span>
        <span className="font-mono text-[9.5px] text-soft tracking-[0.06em] font-medium">
          {summary.rangeLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <BigCell value={`${summary.volumeMin}′`} label="Volumen" />
        <BigCell
          value={summary.rpeAvg != null ? summary.rpeAvg.toFixed(1) : '—'}
          label="RPE medio"
        />
        <BigCell
          value={summary.easyPct != null ? `${summary.easyPct}%` : '—'}
          label="Z1 — Z2"
        />
      </div>
      <div className="h-px bg-hair mt-3 mb-2.5" />
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-[5px] bg-hair rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-trail to-trail-deep rounded-[3px] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[10px] font-semibold text-muted tracking-[0.04em] whitespace-nowrap">
          {summary.sessionsCompleted} / {summary.sessionsTotal} sesiones
        </span>
      </div>
    </section>
  )
}

function BigCell({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[22px] font-bold text-ink tracking-[-0.03em] leading-none tabular-nums">
        {value}
      </div>
      <div className="font-mono text-[8px] tracking-[0.12em] uppercase text-muted font-semibold mt-1.5">
        {label}
      </div>
    </div>
  )
}

function PlanBar({ progress }: { progress: PlanProgress }) {
  return (
    <section className="px-1 mt-2">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-[10px] font-semibold tracking-[0.16em] uppercase text-muted">
          Plan completo
        </span>
        <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-trail">
          {progress.completedPct}%
        </span>
      </div>
      <div className="h-[7px] bg-hair rounded-[4px] overflow-hidden flex gap-[2px]">
        {Array.from({ length: progress.totalWeeks }, (_, i) => {
          const w = i + 1
          const cls =
            w < progress.currentWeek
              ? 'bg-gradient-to-r from-trail to-trail-deep'
              : w === progress.currentWeek
                ? 'bg-trail/40'
                : 'bg-hair'
          return <span key={w} className={`flex-1 ${cls}`} />
        })}
      </div>
      <div className="flex items-center justify-between mt-2 font-mono text-[9.5px] font-medium text-soft tracking-[0.06em]">
        <span>
          Semana{' '}
          <strong className="text-fg font-semibold">{progress.currentWeek}</strong>{' '}
          de {progress.totalWeeks}
        </span>
        <span>
          {progress.completedSessions}/{progress.totalSessions} sesiones
        </span>
      </div>
    </section>
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
