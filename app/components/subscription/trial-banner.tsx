import Link from 'next/link'
import type { AccessState } from '@/lib/subscription'

export function TrialBanner({ access }: { access: AccessState }) {
  if (access.status === 'paid') return null

  if (access.status === 'expired') {
    return (
      <Link
        href="/suscripcion"
        className="block bg-terracotta-tint rounded-2xl p-3.5 mb-5 shadow-[inset_0_0_0_1px_rgba(196,130,109,0.3)] hover:brightness-95 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">⏳</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-terracotta-deep leading-snug">
              Tu acceso terminó
            </p>
            <p className="text-[11.5px] text-ink/70 leading-snug mt-0.5">
              Suscribite para seguir con tu plan.
            </p>
          </div>
          <span className="text-[13px] font-semibold text-terracotta-deep">
            →
          </span>
        </div>
      </Link>
    )
  }

  // trial activo
  const isUrgent = access.daysLeft <= 3
  const tone = isUrgent
    ? 'bg-terracotta-tint shadow-[inset_0_0_0_1px_rgba(196,130,109,0.3)]'
    : 'bg-lichen shadow-[inset_0_0_0_1px_rgba(74,93,58,0.15)]'
  const text = isUrgent ? 'text-terracotta-deep' : 'text-pine'

  return (
    <Link
      href="/suscripcion"
      className={`block ${tone} rounded-2xl p-3.5 mb-5 hover:brightness-95 transition`}
    >
      <div className="flex items-center gap-3">
        <span className="text-base">{isUrgent ? '⏳' : '🌱'}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-bold ${text} leading-snug`}>
            {access.daysLeft === 1
              ? 'Último día de tu trial'
              : `Te quedan ${access.daysLeft} días de tu trial`}
          </p>
          <p className="text-[11.5px] text-ink/70 leading-snug mt-0.5">
            {isUrgent
              ? 'Asegurá tu plan antes de que termine.'
              : 'Conocé los planes cuando quieras.'}
          </p>
        </div>
        <span className={`text-[13px] font-semibold ${text}`}>→</span>
      </div>
    </Link>
  )
}
