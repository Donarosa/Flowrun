import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getSessionById } from '@/lib/plan'
import { getSessionCheckin } from '@/lib/checkin'
import { getSubscription, isLocked } from '@/lib/subscription'
import { getProfileWithMetrics } from '@/lib/profile'
import { getTipForSession, tipCategoryLabel } from '@/lib/education'
import { PaywallBlock } from '@/components/subscription/paywall-block'
import { SessionActions } from './actions-client'
import {
  buildSteps,
  blockTagLabel,
  categoryLabel,
  displayTitle,
  noteFor,
  primaryCategory,
  whyFor,
  type SessionStep,
} from '@/lib/session-presentation'
import type {
  BreathingLevel,
  LegsFatigueLevel,
  SessionIntent,
  TalkTestLevel,
} from '@/types/database'

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`
}

type Params = Promise<{ id: string }>

const TALK_LABEL: Record<TalkTestLevel, string> = {
  phrases: 'Frases completas',
  words: 'Solo palabras',
  none: 'No pude hablar',
}
const BREATHING_LABEL: Record<BreathingLevel, string> = {
  easy: 'Cómoda',
  medium: 'Media',
  hard: 'Agitada',
}
const INTENT_LABEL: Record<SessionIntent, string> = {
  disfrutar: 'Disfrutar',
  mejorar: 'Mejorar',
  trail: 'Trail',
}
const FATIGUE_LABEL: Record<LegsFatigueLevel, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export default async function SessionPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await getUser()
  const session = await getSessionById(id, user!.id)
  if (!session) notFound()
  const checkin = await getSessionCheckin(id)
  const subscription = await getSubscription(user!.id)
  const locked = isLocked(subscription)

  const profileData = await getProfileWithMetrics(user!.id)
  const tip =
    profileData?.profile.experience_level && profileData?.profile.goal_type
      ? await getTipForSession({
          userId: user!.id,
          userSessionId: session.userSessionId,
          blockCodes: session.blocks.map((b) => b.code),
          level: profileData.profile.experience_level,
          goal: profileData.profile.goal_type,
        })
      : null

  const adapted = session.durationModifier !== 1
  const adaptedLabel = adapted
    ? `${session.durationModifier > 1 ? '+' : ''}${Math.round((session.durationModifier - 1) * 100)}%`
    : null

  const title = displayTitle(session.name)
  const why = whyFor(session.blocks)
  const note = noteFor(session.blocks)
  const blockTag = blockTagLabel(session.blocks)
  const cat = primaryCategory(session.blocks)
  const steps = buildSteps(session)

  return (
    <main className="px-6 pt-1 pb-8 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2.5 mt-1.5 mb-3.5">
        <Link
          href="/plan"
          className="w-[34px] h-[34px] rounded-[11px] bg-paper-2 border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] flex items-center justify-center font-mono text-[14px] text-fg font-medium hover:bg-cream transition"
          aria-label="Volver al plan"
        >
          ←
        </Link>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-trail font-semibold flex items-center gap-2.5">
          <span aria-hidden className="w-[18px] h-[1.5px] bg-trail rounded-[1px]" />
          Semana {session.weekNumber} · Sesión
          {session.isDeload && ' · Descarga'}
        </span>
      </div>

      <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink leading-[1.04] mb-2.5 text-balance">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.06em] uppercase text-muted font-semibold mb-4">
        <span>{formatShortDate(session.scheduledDate)}</span>
        <Dot />
        <span>{session.totalDurationMin} min</span>
        <Dot />
        <span>{categoryLabel(cat)}</span>
        {adapted && (
          <>
            <Dot />
            <span className="text-terracotta-deep font-bold">Ajustada {adaptedLabel}</span>
          </>
        )}
        {session.status === 'completed' && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-trail bg-lichen px-2.5 py-1 rounded-full text-[9.5px] tracking-[0.1em]">
            ✓ Hecha
          </span>
        )}
      </div>

      {session.adaptationNote && (
        <div className="border border-terracotta-deep/30 bg-terracotta-tint rounded-[14px] px-4 py-3 mb-4">
          <p className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-terracotta-deep font-bold mb-1.5">
            Ajuste del coach
          </p>
          <p className="text-[12.5px] text-ink leading-[1.5]">
            {session.adaptationNote}
          </p>
        </div>
      )}

      {/* Why card */}
      <div className="grid grid-cols-[auto_1fr] gap-3 items-start bg-lichen rounded-[14px] px-3.5 py-3 mb-5">
        <span className="w-6 h-6 rounded-lg bg-paper border border-trail text-trail flex items-center justify-center shrink-0 mt-0.5">
          <WhyIcon />
        </span>
        <p className="text-[12.5px] leading-[1.45] text-trail-deep tracking-[-0.005em]">
          <strong className="text-ink font-semibold">{why.title}.</strong>{' '}
          {why.body}
        </p>
      </div>

      {/* Block label */}
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-muted font-semibold mb-3.5">
        <span>El entrenamiento</span>
        <span className="text-[8.5px] bg-lichen text-trail px-1.5 py-0.5 rounded-[5px] tracking-[0.1em] truncate max-w-[60%]">
          {blockTag}
        </span>
      </div>

      {/* Stepper */}
      <ol className="mb-4">
        {steps.map((step, i) => (
          <Step
            key={`${step.name}-${i}`}
            step={step}
            num={i + 1}
            isLast={i === steps.length - 1}
          />
        ))}
      </ol>

      {/* Note card */}
      <div className="bg-cream border border-hair rounded-[13px] px-3.5 py-3 mb-4 grid grid-cols-[auto_1fr] gap-3 items-start">
        <span className="font-mono text-[10px] font-bold text-trail bg-paper border border-trail w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          i
        </span>
        <p className="text-[12px] text-fg leading-[1.5] tracking-[-0.005em]">
          {note}
        </p>
      </div>

      {tip && (
        <aside
          className="rounded-[14px] border border-lichen-deep px-4 py-3 mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
          style={{
            background:
              'linear-gradient(180deg, var(--color-lichen) 0%, oklch(91% 0.02 145) 100%)',
          }}
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-[9.5px] tracking-[0.18em] uppercase text-trail-deep font-bold">
            <InfoIcon />
            <span>{tipCategoryLabel(tip.category)}</span>
          </div>
          <p className="text-[12.5px] text-ink leading-[1.5] tracking-[-0.005em]">
            {tip.contentEs}
          </p>
        </aside>
      )}

      {checkin && (
        <section className="rounded-[14px] border border-trail-tint bg-trail-tint px-4 py-3.5 mb-4">
          <h3 className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-trail font-bold mb-3 flex items-center gap-2.5">
            <span aria-hidden className="w-[14px] h-[1.5px] bg-trail rounded-[1px]" />
            Tu check-in
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12.5px]">
            <CheckinRow label="Sensación" value={`${checkin.rpe}/5`} />
            <CheckinRow label="Habla" value={TALK_LABEL[checkin.talk_test]} />
            <CheckinRow label="Respiración" value={BREATHING_LABEL[checkin.breathing]} />
            <CheckinRow label="Objetivo" value={INTENT_LABEL[checkin.intent]} />
            <CheckinRow label="Dolor" value={checkin.pain ? 'Sí' : 'No'} />
            <CheckinRow
              label="Fatiga piernas"
              value={checkin.legs_fatigue ? FATIGUE_LABEL[checkin.legs_fatigue] : '—'}
            />
          </dl>
          {checkin.notes && (
            <p className="text-[12.5px] text-ink leading-[1.5] mt-3 pt-3 border-t border-trail/15">
              {checkin.notes}
            </p>
          )}
        </section>
      )}

      <div className="mt-2 -mx-6 px-6 pt-3.5 pb-1 border-t border-hair bg-gradient-to-t from-cream via-cream/85 to-transparent">
        {locked ? (
          <PaywallBlock
            title="Tu acceso terminó"
            body="Suscribite para volver a marcar sesiones y hacer check-ins."
          />
        ) : (
          <SessionActions
            userSessionId={session.userSessionId}
            status={session.status}
            hasCheckin={!!checkin}
          />
        )}
      </div>
    </main>
  )
}

function Step({
  step,
  num,
  isLast,
}: {
  step: SessionStep
  num: number
  isLast: boolean
}) {
  const isWork = step.kind === 'work'
  const nodeClass = isWork
    ? 'border-trail bg-trail text-white shadow-[0_0_0_4px_var(--color-trail-tint)]'
    : 'border-[color-mix(in_oklch,var(--color-warn)_55%,white)] bg-[color-mix(in_oklch,var(--color-warn)_22%,white)] text-warn-deep shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-warn)_8%,white)]'

  const effortColor =
    step.effort.level === 'hard'
      ? 'text-alert'
      : step.effort.level === 'soft'
        ? 'text-trail'
        : 'text-muted'
  const effortDots =
    step.effort.level === 'hard'
      ? 'bg-alert'
      : step.effort.level === 'soft'
        ? 'bg-trail'
        : 'bg-muted'

  return (
    <li className="grid grid-cols-[30px_1fr] gap-3 relative">
      <div className="flex flex-col items-center">
        <div
          className={`w-[30px] h-[30px] rounded-full border-[1.5px] flex items-center justify-center font-mono text-[11px] font-bold shrink-0 z-10 ${nodeClass}`}
        >
          {num}
        </div>
        {!isLast && <div className="flex-1 w-[1.5px] bg-hair my-0.5" />}
      </div>
      <div className="pb-4 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[14px] font-semibold text-ink tracking-[-0.015em] leading-[1.2]">
            {step.name}
          </span>
          <span className="font-mono text-[11px] text-muted font-semibold whitespace-nowrap">
            {step.duration}
          </span>
        </div>
        <p className="text-[12px] text-muted leading-[1.4] mt-0.5 tracking-[-0.005em]">
          {step.description}
        </p>

        {!step.repeats && (
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase mt-1.5 ${effortColor}`}
          >
            <span className="inline-flex gap-[2.5px]">
              <span className={`w-[5px] h-[5px] rounded-full ${effortDots}`} />
              <span className={`w-[5px] h-[5px] rounded-full ${step.effort.level === 'hard' ? effortDots : 'bg-border'}`} />
              <span className={`w-[5px] h-[5px] rounded-full ${step.effort.level === 'hard' ? effortDots : 'bg-border'}`} />
            </span>
            {step.effort.label}
          </span>
        )}

        {step.repeats && (
          <div className="mt-2.5 border border-border rounded-[13px] overflow-hidden bg-paper-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-trail-tint to-paper-2 border-b border-hair">
              <span className="font-mono text-[9.5px] font-semibold tracking-[0.14em] uppercase text-muted">
                Repetir
              </span>
              <span className="font-mono font-bold text-trail text-[15px] tracking-[0.01em]">
                ×{step.repeats.reps}{' '}
                <small className="text-[9px] font-semibold tracking-[0.12em] uppercase text-muted">veces</small>
              </span>
            </div>
            <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 items-center px-3 py-2">
              <span className="w-[22px] h-[22px] rounded-[7px] bg-trail text-white flex items-center justify-center font-mono font-bold text-[11px]">↑</span>
              <span className="min-w-0">
                <div className="text-[12.5px] font-semibold text-ink leading-[1.25] tracking-[-0.012em]">
                  {step.repeats.go.main}
                </div>
                <div className="text-[10.5px] text-muted mt-px tracking-[-0.005em]">
                  {step.repeats.go.sub}
                </div>
              </span>
              <span className="font-mono text-[8.5px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-md bg-[color-mix(in_oklch,var(--color-alert)_14%,white)] text-alert whitespace-nowrap">
                Fuerte
              </span>
            </div>
            <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 items-center px-3 py-2 border-t border-dashed border-hair">
              <span className="w-[22px] h-[22px] rounded-[7px] bg-cream text-soft border border-border flex items-center justify-center font-mono font-bold text-[11px]">↻</span>
              <span className="min-w-0">
                <div className="text-[12.5px] font-medium text-muted leading-[1.25] tracking-[-0.012em]">
                  {step.repeats.rec.main}
                </div>
                <div className="text-[10.5px] text-muted mt-px tracking-[-0.005em]">
                  {step.repeats.rec.sub}
                </div>
              </span>
              <span className="font-mono text-[8.5px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-md bg-lichen text-trail whitespace-nowrap">
                Recup
              </span>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

function CheckinRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-[10.5px] font-medium">{label}</dt>
      <dd className="text-ink font-semibold mt-0.5">{value}</dd>
    </div>
  )
}

function Dot() {
  return <span aria-hidden className="w-[3px] h-[3px] bg-soft rounded-full" />
}

function WhyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 6a6 6 0 0 1 6 6M12 18a6 6 0 0 1-6-6" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}
