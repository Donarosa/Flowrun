'use client'

import { useState, useTransition } from 'react'
import type {
  Currency,
  PaymentMethod,
  SubscriptionPlan,
} from '@/types/database'
import { subscribePlan } from './actions'

const PLAN_INFO: Record<
  SubscriptionPlan,
  {
    label: string
    headline: string
    ars: number
    usd: number
    duration: string
    perks: string[]
    isPack: boolean
  }
> = {
  monthly: {
    label: 'Mensual',
    headline: 'Pay-as-you-go',
    ars: 7000,
    usd: 5,
    duration: '/ mes',
    perks: [
      'Acceso completo · todo incluido',
      'Las pistas + planes avanzados',
      'Motor de adaptación + mensajes del Profe',
      'Cancelás cuando querés',
    ],
    isPack: false,
  },
  pack_3m: {
    label: 'Pack 3 meses',
    headline: 'Más ahorro',
    ars: 18000,
    usd: 12,
    duration: '/ 3 meses',
    perks: [
      'Mismo acceso completo que el mensual',
      '14% off pagando en ARS · 20% off en USD',
      'Pago único, sin renovación automática',
      'Tope máximo: 3 meses por compra',
    ],
    isPack: true,
  },
}

function formatArs(n: number): string {
  return n.toLocaleString('es-AR')
}

export function PlansGrid({ isArgentina }: { isArgentina: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <PlanCard plan="monthly" isArgentina={isArgentina} />
      <PlanCard plan="pack_3m" isArgentina={isArgentina} />
    </div>
  )
}

function PlanCard({
  plan,
  isArgentina,
}: {
  plan: SubscriptionPlan
  isArgentina: boolean
}) {
  const info = PLAN_INFO[plan]
  const [pending, startTransition] = useTransition()
  const [method, setMethod] = useState<PaymentMethod | null>(null)

  const onPay = (paymentMethod: PaymentMethod) => {
    setMethod(paymentMethod)
    const currency: Currency = isArgentina ? 'ARS' : 'USD'
    startTransition(async () => {
      await subscribePlan({ plan, paymentMethod, currency })
    })
  }

  const cardTone = info.isPack
    ? 'bg-pine-deep text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
    : 'bg-paper-2 text-ink shadow-[inset_0_0_0_1px_var(--color-border)]'

  const eyebrow = info.isPack ? 'text-moss-soft' : 'text-trail'
  const muted = info.isPack ? 'text-white/65' : 'text-muted'
  const checkColor = info.isPack ? 'text-moss-soft' : 'text-trail'

  return (
    <article className={`rounded-3xl p-5 ${cardTone}`}>
      <p
        className={`font-mono text-[10px] tracking-[0.14em] uppercase font-bold mb-2 ${eyebrow}`}
      >
        {info.label}
      </p>
      <h2 className="text-xl font-extrabold tracking-tight leading-tight mb-3">
        {info.headline}
      </h2>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-4xl font-extrabold tracking-tight">
          {isArgentina ? `$${formatArs(info.ars)}` : `$${info.usd}`}
        </span>
        <span className={`text-[12px] font-mono ${muted}`}>
          {isArgentina ? 'ARS' : 'USD'}
        </span>
        <span className={`text-[12px] ${muted}`}>{info.duration}</span>
      </div>

      {info.isPack && (
        <span
          className={`inline-block ${info.isPack ? 'bg-moss text-white' : ''} text-[11px] font-mono font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full mb-3`}
        >
          Ahorrás 20%
        </span>
      )}

      <ul className="flex flex-col gap-1.5 mb-5">
        {info.perks.map((p, i) => (
          <li
            key={i}
            className="text-[12.5px] leading-snug flex items-start gap-2"
          >
            <span className={`shrink-0 font-bold ${checkColor}`}>✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onPay('card')}
          disabled={pending}
          className={
            info.isPack
              ? 'w-full py-3.5 rounded-full bg-white text-pine-deep font-semibold text-[14px] tracking-tight hover:brightness-95 transition disabled:opacity-60'
              : 'w-full py-3.5 rounded-full bg-trail text-white font-semibold text-[14px] tracking-tight hover:bg-trail-deep transition disabled:opacity-60'
          }
        >
          {pending && method === 'card'
            ? 'Procesando…'
            : 'Pagar con tarjeta'}
        </button>
        {isArgentina && (
          <button
            type="button"
            onClick={() => onPay('transfer')}
            disabled={pending}
            className={
              info.isPack
                ? 'w-full py-3.5 rounded-full bg-white/0 text-white font-semibold text-[14px] tracking-tight shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)] hover:bg-white/10 transition disabled:opacity-60'
                : 'w-full py-3.5 rounded-full bg-paper-2 text-ink font-semibold text-[14px] tracking-tight shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream transition disabled:opacity-60'
            }
          >
            {pending && method === 'transfer'
              ? 'Procesando…'
              : 'Pagar por transferencia'}
          </button>
        )}
      </div>
    </article>
  )
}
