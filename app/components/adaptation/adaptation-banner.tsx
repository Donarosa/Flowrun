import type { AdaptationLogRow } from '@/types/database'

type Props = {
  log: AdaptationLogRow | null
}

// Mensaje del coach: aparece cuando hay una adaptación reciente y todavía
// estamos en la semana que recibió el ajuste (week_number + 1).
// Si no aplica, no renderiza nada.
export function AdaptationBanner({ log }: Props) {
  if (!log) return null

  // Heurística simple: mostramos siempre la última (no tenemos current_week
  // computado en el plan todavía — ese refinamiento queda para el slice de
  // gate criteria). Si el log tiene < 14 días, lo mostramos.
  const ageMs = Date.now() - new Date(log.created_at).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (ageDays > 14) return null

  const tone = pickTone(log.rule_triggered)

  return (
    <article
      className={`rounded-2xl p-4 mb-5 shadow-[inset_0_0_0_1px_${tone.border}]`}
      style={{ backgroundColor: tone.bg }}
    >
      <div className="flex items-start gap-3">
        <span className="text-base shrink-0">{tone.emoji}</span>
        <div className="flex-1 min-w-0">
          <p
            className={`font-mono text-[10px] tracking-[0.14em] uppercase font-bold mb-1.5 ${tone.eyebrow}`}
          >
            Mensaje del Profe
          </p>
          <p className="text-[13px] text-ink leading-snug">{log.message_es}</p>
        </div>
      </div>
    </article>
  )
}

function pickTone(rule: string) {
  if (rule === 'sustainable_progression') {
    return {
      emoji: '🌿',
      bg: 'var(--color-lichen)',
      border: 'rgba(74,93,58,0.15)',
      eyebrow: 'text-pine',
    }
  }
  if (rule === 'low_adherence') {
    return {
      emoji: '🪶',
      bg: 'var(--color-paper-2)',
      border: 'var(--color-border)',
      eyebrow: 'text-stone',
    }
  }
  if (rule === 'fatigue_high') {
    return {
      emoji: '⚠️',
      bg: 'var(--color-terracotta-tint)',
      border: 'rgba(196,130,109,0.3)',
      eyebrow: 'text-terracotta-deep',
    }
  }
  return {
    emoji: '🌱',
    bg: 'var(--color-paper-2)',
    border: 'var(--color-border)',
    eyebrow: 'text-trail',
  }
}
