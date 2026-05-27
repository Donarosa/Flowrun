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
import type {
  BreathingLevel,
  LegsFatigueLevel,
  SessionIntent,
  TalkTestLevel,
} from '@/types/database'

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`
}

const BLOCK_ZONE: Record<string, string> = {
  RS: 'Z1—Z2',
  RW: 'Z1',
  SC: 'Z2—Z3',
  FE: 'Z3',
  SMC: 'Z2—Z3',
  FK: 'Z2—Z3',
  TE: 'Z3',
  PR: 'Z2—Z3',
  HF: 'Z3—Z4',
  HK: 'Z1',
  RC: 'Z3—Z4',
  SU: 'Z2',
}

function dominantZones(codes: string[]): string {
  const zones = new Set<string>()
  for (const c of codes) {
    const z = BLOCK_ZONE[c]
    if (!z) continue
    z.split('—').forEach((p) => zones.add(p))
  }
  if (zones.size === 0) return ''
  return Array.from(zones).sort().join(' · ')
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

  const zoneSummary = dominantZones(session.blocks.map((b) => b.code))
  const adapted = session.durationModifier !== 1
  const adaptedLabel = adapted
    ? `${session.durationModifier > 1 ? '+' : ''}${Math.round((session.durationModifier - 1) * 100)}%`
    : null

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
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted font-semibold">
          Semana {session.weekNumber} · Sesión
          {session.isDeload && ' · Descarga'}
        </span>
      </div>

      <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-ink leading-[1.08] mb-1.5 text-balance">
        {session.name}
      </h1>

      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted font-semibold mb-[18px]">
        <span>{formatShortDate(session.scheduledDate)}</span>
        <Dot />
        <span>{session.totalDurationMin} min</span>
        {zoneSummary && (
          <>
            <Dot />
            <span>{zoneSummary}</span>
          </>
        )}
        {adapted && (
          <>
            <Dot />
            <span className="text-terracotta-deep font-bold">
              Ajustada {adaptedLabel}
            </span>
          </>
        )}
        {session.status === 'completed' && (
          <span className="ml-auto text-pine font-bold">✓ Hecha</span>
        )}
      </div>

      {session.adaptationNote && (
        <div className="border border-terracotta-deep/30 bg-terracotta-tint rounded-[14px] px-4 py-3 mb-3">
          <p className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-terracotta-deep font-bold mb-1.5">
            Ajuste del coach
          </p>
          <p className="text-[12.5px] text-ink leading-[1.5]">
            {session.adaptationNote}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-3.5">
        {session.blocks.map((b, i) => (
          <BlockCard key={`${b.code}-${i}`} block={b} />
        ))}
      </div>

      {tip && (
        <aside
          className="rounded-[14px] border border-lichen-deep px-4 py-3 mb-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
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
        <section className="rounded-[14px] border border-trail-tint bg-trail-tint px-4 py-3.5 mb-3.5">
          <h3 className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-trail font-bold mb-3 flex items-center gap-2.5">
            <span aria-hidden className="w-[14px] h-[1.5px] bg-trail rounded-[1px]" />
            Tu check-in
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12.5px]">
            <CheckinRow label="Sensación" value={`${checkin.rpe}/5`} />
            <CheckinRow label="Habla" value={TALK_LABEL[checkin.talk_test]} />
            <CheckinRow
              label="Respiración"
              value={BREATHING_LABEL[checkin.breathing]}
            />
            <CheckinRow label="Objetivo" value={INTENT_LABEL[checkin.intent]} />
            <CheckinRow label="Dolor" value={checkin.pain ? 'Sí' : 'No'} />
            <CheckinRow
              label="Fatiga piernas"
              value={
                checkin.legs_fatigue ? FATIGUE_LABEL[checkin.legs_fatigue] : '—'
              }
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

function BlockCard({
  block,
}: {
  block: {
    code: string
    name: string
    description: string | null
    durationMin: number
    note?: string
  }
}) {
  const zone = BLOCK_ZONE[block.code]
  return (
    <article className="bg-paper-2 border border-border rounded-[14px] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
      <header className="flex justify-between items-center px-4 py-[11px] bg-cream border-b border-border">
        <span className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-trail font-bold">
          {block.code}
          {zone && <span className="text-muted font-semibold ml-1.5">· {zone}</span>}
        </span>
        <span className="font-mono text-[11px] font-bold text-ink tracking-[0.02em] tabular-nums">
          {block.durationMin}′
        </span>
      </header>
      <div className="px-4 py-3">
        <h3 className="text-[15px] font-semibold text-ink tracking-[-0.018em] leading-[1.25] mb-1.5">
          {block.name}
        </h3>
        {block.description && (
          <p className="text-[12.5px] text-muted leading-[1.5] tracking-[-0.005em]">
            {block.description}
          </p>
        )}
        {block.note && (
          <div className="mt-2.5 pl-3 border-l-2 border-lichen-deep">
            <p className="text-[12px] text-ink leading-[1.45]">{block.note}</p>
          </div>
        )}
      </div>
    </article>
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
  return (
    <span aria-hidden className="w-[3px] h-[3px] bg-soft rounded-full" />
  )
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="13"
      height="13"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}
