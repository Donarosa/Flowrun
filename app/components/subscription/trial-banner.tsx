import Link from 'next/link'
import type { AccessState } from '@/lib/subscription'

export function TrialBanner({ access }: { access: AccessState }) {
  if (access.status === 'paid') return null

  if (access.status === 'expired') {
    return (
      <Link
        href="/suscripcion"
        className="block mb-3.5 rounded-[14px] border border-terracotta-deep/30 bg-terracotta-tint px-4 py-3 hover:brightness-95 transition"
      >
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-base shrink-0 mt-px">⏳</span>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-terracotta-deep font-bold mb-1">
              Acceso expirado
            </p>
            <p className="text-[13px] text-ink leading-snug font-semibold">
              Suscribite para seguir con tu plan.
            </p>
          </div>
          <span aria-hidden className="text-[14px] text-terracotta-deep font-bold">
            →
          </span>
        </div>
      </Link>
    )
  }

  const isUrgent = access.daysLeft <= 3
  const wrapClass = isUrgent
    ? 'border-terracotta-deep/30 bg-terracotta-tint'
    : 'border-lichen-deep bg-lichen'
  const eyebrowClass = isUrgent ? 'text-terracotta-deep' : 'text-trail-deep'
  const arrowClass = isUrgent ? 'text-terracotta-deep' : 'text-trail-deep'

  return (
    <Link
      href="/suscripcion"
      className={`block mb-3.5 rounded-[14px] border px-4 py-3 hover:brightness-95 transition ${wrapClass}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-base shrink-0 mt-px">
          {isUrgent ? '⏳' : '🌱'}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`font-mono text-[9.5px] tracking-[0.18em] uppercase font-bold mb-1 ${eyebrowClass}`}
          >
            {isUrgent ? 'Trial terminando' : 'Trial activo'}
          </p>
          <p className="text-[13px] text-ink leading-snug font-semibold">
            {access.daysLeft === 1
              ? 'Último día de tu trial.'
              : `Te quedan ${access.daysLeft} días de tu trial.`}
          </p>
          <p className="text-[11.5px] text-ink/70 leading-snug mt-0.5">
            {isUrgent
              ? 'Asegurá tu plan antes de que termine.'
              : 'Conocé los planes cuando quieras.'}
          </p>
        </div>
        <span aria-hidden className={`text-[14px] font-bold ${arrowClass}`}>
          →
        </span>
      </div>
    </Link>
  )
}
