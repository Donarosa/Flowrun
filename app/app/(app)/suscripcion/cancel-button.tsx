'use client'

import { useState, useTransition } from 'react'
import { cancelSubscription } from './actions'

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

function formatDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  return `${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]}`
}

export function CancelButton({ periodEnd }: { periodEnd: string }) {
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onCancel = () => {
    setError(null)
    startTransition(async () => {
      try {
        const res = await cancelSubscription()
        setDone(res.periodEnd ?? periodEnd)
        setConfirming(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cancelar')
      }
    })
  }

  if (done) {
    return (
      <div className="mb-5 rounded-2xl bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] p-4 text-center">
        <p className="text-[13px] text-ink leading-[1.5]">
          ✓ Tu suscripción se canceló. Mantenés acceso completo hasta el{' '}
          <strong className="font-semibold">{formatDate(done)}</strong>.
        </p>
      </div>
    )
  }

  if (confirming) {
    return (
      <div className="mb-5 rounded-2xl bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] p-4">
        <p className="text-[13px] text-ink leading-[1.5] mb-3 text-center">
          ¿Seguro que querés cancelar?
          <br />
          <span className="text-muted">
            Mantenés acceso hasta el {formatDate(periodEnd)}.
          </span>
        </p>
        {error && (
          <p className="text-[12px] text-terracotta-deep text-center mb-2">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setConfirming(false)
              setError(null)
            }}
            disabled={pending}
            className="flex-1 py-3 rounded-full bg-paper-2 text-ink font-semibold text-[13px] shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream transition disabled:opacity-60"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 py-3 rounded-full bg-terracotta-deep text-white font-semibold text-[13px] hover:brightness-95 transition disabled:opacity-60"
          >
            {pending ? 'Cancelando…' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="mb-5 w-full flex items-center justify-between gap-3 rounded-2xl bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] px-4 py-3.5 text-left hover:bg-cream transition"
    >
      <span className="flex-1 min-w-0">
        <span className="block text-[13.5px] font-semibold text-ink tracking-[-0.012em]">
          Cancelar suscripción
        </span>
        <span className="block text-[11.5px] text-muted mt-0.5">
          Mantenés acceso hasta el {formatDate(periodEnd)}
        </span>
      </span>
      <span aria-hidden className="text-[14px] text-muted font-medium">
        →
      </span>
    </button>
  )
}
