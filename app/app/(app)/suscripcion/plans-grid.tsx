'use client'

import { useState, useTransition } from 'react'
import type {
  Currency,
  PaymentMethod,
  SubscriptionPlan,
} from '@/types/database'
import { subscribePlan } from './actions'

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

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
    ars: 16800,
    usd: 12,
    duration: '/ 3 meses',
    perks: [
      'Mismo acceso completo que el mensual',
      '20% off comparado con pagar 3 meses sueltos',
      'Se renueva cada 3 meses',
      'Cancelás cuando querés',
    ],
    isPack: true,
  },
}

function formatArs(n: number): string {
  return n.toLocaleString('es-AR')
}

export function PlansGrid({
  isArgentina,
  userEmail,
}: {
  isArgentina: boolean
  userEmail: string
}) {
  const [transferTarget, setTransferTarget] = useState<SubscriptionPlan | null>(
    null,
  )

  return (
    <>
      <div className="flex flex-col gap-4">
        <PlanCard
          plan="monthly"
          isArgentina={isArgentina}
          onTransfer={() => setTransferTarget('monthly')}
        />
        <PlanCard
          plan="pack_3m"
          isArgentina={isArgentina}
          onTransfer={() => setTransferTarget('pack_3m')}
        />
      </div>
      {transferTarget && (
        <TransferModal
          plan={transferTarget}
          isArgentina={isArgentina}
          userEmail={userEmail}
          onClose={() => setTransferTarget(null)}
        />
      )}
    </>
  )
}

function PlanCard({
  plan,
  isArgentina,
  onTransfer,
}: {
  plan: SubscriptionPlan
  isArgentina: boolean
  onTransfer: () => void
}) {
  const info = PLAN_INFO[plan]
  const [pending, startTransition] = useTransition()
  const [method, setMethod] = useState<PaymentMethod | null>(null)

  const onPayCard = () => {
    setMethod('card')
    const currency: Currency = isArgentina ? 'ARS' : 'USD'
    startTransition(async () => {
      await subscribePlan({ plan, paymentMethod: 'card', currency })
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
          onClick={onPayCard}
          disabled={pending}
          className={
            info.isPack
              ? 'w-full py-3.5 rounded-full bg-white text-pine-deep font-semibold text-[14px] tracking-tight hover:brightness-95 transition disabled:opacity-60'
              : 'w-full py-3.5 rounded-full bg-trail text-white font-semibold text-[14px] tracking-tight hover:bg-trail-deep transition disabled:opacity-60'
          }
        >
          {pending && method === 'card' ? 'Procesando…' : 'Pagar con tarjeta'}
        </button>
        {isArgentina && (
          <button
            type="button"
            onClick={onTransfer}
            disabled={pending}
            className={
              info.isPack
                ? 'w-full py-3.5 rounded-full bg-white/0 text-white font-semibold text-[14px] tracking-tight shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)] hover:bg-white/10 transition disabled:opacity-60'
                : 'w-full py-3.5 rounded-full bg-paper-2 text-ink font-semibold text-[14px] tracking-tight shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream transition disabled:opacity-60'
            }
          >
            Pagar por transferencia
          </button>
        )}
      </div>
    </article>
  )
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

function TransferModal({
  plan,
  isArgentina,
  userEmail,
  onClose,
}: {
  plan: SubscriptionPlan
  isArgentina: boolean
  userEmail: string
  onClose: () => void
}) {
  const info = PLAN_INFO[plan]
  const [status, setStatus] = useState<Status>('idle')

  const amountLabel = isArgentina
    ? `ARS $${formatArs(info.ars)}`
    : `USD $${info.usd}`

  async function onConfirm() {
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Nueva solicitud de transferencia · FlowRun · ${info.label}`,
          from_name: 'Solicitud transferencia FlowRun',
          email: userEmail,
          message:
            `Un usuario quiere pagar por transferencia.\n\n` +
            `Plan: ${info.label} (${plan})\n` +
            `Monto: ${amountLabel}\n` +
            `Email del usuario: ${userEmail}\n\n` +
            `Respondé a este mail con los datos de la cuenta (CBU / alias) ` +
            `para que el usuario transfiera. Una vez recibida la ` +
            `transferencia, activá el plan manualmente.`,
          botcheck: '',
        }),
      })
      const data = await res.json()
      if (data.success) setStatus('sent')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center px-4 pb-4 pt-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-paper-2 shadow-[0_24px_60px_-12px_rgba(27,31,27,0.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-trail text-cream px-5 pt-5 pb-5 relative">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase font-bold text-cream/70 mb-1.5">
            Transferencia
          </p>
          <p className="text-[18px] font-semibold tracking-[-0.02em] leading-tight">
            {status === 'sent'
              ? '¡Solicitud enviada!'
              : 'Pedir datos para transferir'}
          </p>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-cream/15 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5">
          {status === 'sent' ? (
            <SentBody userEmail={userEmail} onClose={onClose} />
          ) : (
            <IdleBody
              info={info}
              amountLabel={amountLabel}
              userEmail={userEmail}
              status={status}
              onConfirm={onConfirm}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function IdleBody({
  info,
  amountLabel,
  userEmail,
  status,
  onConfirm,
  onClose,
}: {
  info: (typeof PLAN_INFO)[SubscriptionPlan]
  amountLabel: string
  userEmail: string
  status: Status
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <>
      <div className="bg-cream rounded-2xl p-4 mb-4">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-trail font-bold">
            Plan
          </span>
          <span className="text-[14px] font-semibold text-ink tracking-[-0.005em]">
            {info.label}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-trail font-bold">
            Monto
          </span>
          <span className="text-[14px] font-semibold text-ink tracking-[-0.005em]">
            {amountLabel}
          </span>
        </div>
      </div>

      <ol className="flex flex-col gap-3 mb-5">
        <Step n={1}>
          Enviás una notificación de transferencia.
        </Step>
        <Step n={2}>
          Te llega un email a{' '}
          <strong className="text-ink break-all">{userEmail}</strong> con los
          datos de la cuenta para transferir.
        </Step>
        <Step n={3}>
          Una vez recibida la transferencia, en hasta{' '}
          <strong className="text-ink">1 hora</strong> activamos tu plan.
        </Step>
      </ol>

      {status === 'error' && (
        <p className="text-[13px] text-alert mb-3 px-1">
          No se pudo enviar. Probá de nuevo o escribinos a flowrun200@gmail.com.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={status === 'sending'}
          className="w-full py-3.5 rounded-full bg-trail text-white font-semibold text-[14px] tracking-tight hover:bg-trail-deep transition disabled:opacity-60"
        >
          {status === 'sending' ? 'Enviando…' : 'Enviar notificación'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={status === 'sending'}
          className="w-full py-3 rounded-full text-muted text-[13px] font-medium hover:text-ink transition disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </>
  )
}

function SentBody({
  userEmail,
  onClose,
}: {
  userEmail: string
  onClose: () => void
}) {
  return (
    <>
      <div className="mx-auto w-12 h-12 rounded-full bg-trail-tint flex items-center justify-center mb-4">
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-trail"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <p className="text-[14px] text-fg leading-relaxed text-center mb-1">
        Te enviamos los datos para transferir a{' '}
        <strong className="text-ink break-all">{userEmail}</strong>.
      </p>
      <p className="text-[13px] text-muted leading-relaxed text-center mb-5">
        Una vez recibida la transferencia, en hasta{' '}
        <strong className="text-ink">1 hora</strong> activamos tu plan.
        Revisá tu casilla (y la carpeta de spam por las dudas).
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3.5 rounded-full bg-trail text-white font-semibold text-[14px] tracking-tight hover:bg-trail-deep transition"
      >
        Cerrar
      </button>
    </>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[28px_1fr] items-start gap-3 text-[13px] text-muted leading-[1.5]">
      <span className="w-7 h-7 rounded-full bg-trail-tint text-trail font-mono font-bold text-[12px] flex items-center justify-center shrink-0">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}
