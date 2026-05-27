import type { AdaptationLogRow } from '@/types/database'

type Props = {
  log: AdaptationLogRow | null
}

export function AdaptationBanner({ log }: Props) {
  if (!log) return null

  // eslint-disable-next-line react-hooks/purity -- SSR per-request
  const ageMs = Date.now() - new Date(log.created_at).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (ageDays > 14) return null

  const tone = pickTone(log.rule_triggered)

  return (
    <article
      className={`rounded-[14px] border px-4 py-3 mb-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${tone.wrap}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-base shrink-0 mt-px">
          {tone.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`font-mono text-[9.5px] tracking-[0.18em] uppercase font-bold mb-1.5 ${tone.eyebrow}`}
          >
            Mensaje del profe
          </p>
          <p className="text-[13px] text-ink leading-snug">{log.message_es}</p>
        </div>
      </div>
    </article>
  )
}

function pickTone(rule: string) {
  if (rule === 'sustainable_progression' || rule === 'gate_passed') {
    return {
      emoji: '🌿',
      wrap: 'bg-lichen border-lichen-deep',
      eyebrow: 'text-pine',
    }
  }
  if (rule === 'plan_completed') {
    return {
      emoji: '⛰️',
      wrap: 'bg-lichen border-lichen-deep',
      eyebrow: 'text-pine',
    }
  }
  if (rule === 'low_adherence') {
    return {
      emoji: '🪶',
      wrap: 'bg-paper-2 border-border',
      eyebrow: 'text-stone',
    }
  }
  if (
    rule === 'fatigue_high' ||
    rule === 'gate_failed' ||
    rule === 'graduation_pending'
  ) {
    return {
      emoji: '⏳',
      wrap: 'bg-terracotta-tint border-terracotta-deep/30',
      eyebrow: 'text-terracotta-deep',
    }
  }
  return {
    emoji: '🌱',
    wrap: 'bg-paper-2 border-border',
    eyebrow: 'text-trail',
  }
}
