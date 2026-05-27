'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { SessionStatus } from '@/types/database'
import { markSessionDone, markSessionPending } from '../actions'

type Props = {
  userSessionId: string
  status: SessionStatus
  hasCheckin: boolean
}

export function SessionActions({
  userSessionId,
  status,
  hasCheckin,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useState(status)
  const done = optimisticStatus === 'completed'

  const onQuickDone = () => {
    setOptimisticStatus('completed')
    startTransition(async () => {
      try {
        await markSessionDone(userSessionId)
      } catch {
        setOptimisticStatus(status)
      }
    })
  }

  const onUndo = () => {
    setOptimisticStatus('pending')
    startTransition(async () => {
      try {
        await markSessionPending(userSessionId)
      } catch {
        setOptimisticStatus(status)
      }
    })
  }

  if (done) {
    return (
      <div>
        <div className="flex justify-between items-center font-mono text-[10px] tracking-[0.12em] uppercase text-muted font-semibold mb-2.5">
          <span>Sesión hecha</span>
          <span className="text-pine">Lista ✓</span>
        </div>
        <Link
          href={`/sesion/${userSessionId}/checkin`}
          className="w-full flex items-center justify-between text-white font-semibold text-[14.5px] tracking-[-0.005em] rounded-[13px] px-5 min-h-[48px] bg-gradient-to-b from-trail to-trail-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(20,30,20,0.1),0_6px_14px_-6px_rgba(61,107,63,0.5)] hover:brightness-[1.03] transition"
        >
          <span>{hasCheckin ? 'Editar check-in' : 'Agregar check-in'}</span>
          <span
            aria-hidden
            className="font-mono w-7 h-7 rounded-[9px] bg-white/15 flex items-center justify-center text-[13px] font-medium"
          >
            →
          </span>
        </Link>
        <button
          type="button"
          onClick={onUndo}
          disabled={pending}
          className="w-full text-center mt-2.5 font-mono text-[10px] tracking-[0.1em] uppercase text-soft font-semibold hover:text-muted transition disabled:opacity-50"
        >
          {pending ? 'Deshaciendo…' : 'Deshacer · marcar como pendiente'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center font-mono text-[10px] tracking-[0.12em] uppercase text-muted font-semibold mb-2.5">
        <span>Próximo paso</span>
        <span className="text-trail">Check-in</span>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-2 items-stretch">
        <button
          type="button"
          onClick={onQuickDone}
          disabled={pending}
          className="bg-paper-2 border border-border text-muted font-mono font-semibold text-[14px] rounded-[13px] px-3.5 min-h-[48px] min-w-[48px] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] hover:bg-cream transition disabled:opacity-50"
          aria-label={pending ? 'Guardando' : 'Marcar sin check-in'}
        >
          {pending ? '…' : '···'}
        </button>
        <Link
          href={`/sesion/${userSessionId}/checkin`}
          className="flex items-center justify-between gap-2 text-white font-semibold text-[14.5px] tracking-[-0.005em] rounded-[13px] pl-5 pr-4 min-h-[48px] bg-gradient-to-b from-trail to-trail-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(20,30,20,0.1),0_6px_14px_-6px_rgba(61,107,63,0.5)] hover:brightness-[1.03] transition"
        >
          <span>Hice esta sesión</span>
          <span
            aria-hidden
            className="font-mono w-7 h-7 rounded-[9px] bg-white/15 flex items-center justify-center text-[13px] font-medium"
          >
            →
          </span>
        </Link>
      </div>
      <button
        type="button"
        onClick={onQuickDone}
        disabled={pending}
        className="w-full text-center mt-2.5 font-mono text-[10px] tracking-[0.1em] uppercase text-soft font-semibold hover:text-muted transition disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Saltar check-in · marcar hecha'}
      </button>
    </div>
  )
}
