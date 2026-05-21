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

  // Si ya está hecha, opciones: editar check-in (si tiene) o deshacer.
  if (done) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href={`/sesion/${userSessionId}/checkin`}
          className="w-full py-4 rounded-full bg-paper-2 text-ink font-semibold text-[15px] tracking-tight text-center shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream transition"
        >
          {hasCheckin ? 'Editar check-in' : 'Agregar check-in'}
        </Link>
        <button
          type="button"
          onClick={onUndo}
          disabled={pending}
          className="py-3 text-[13px] text-muted font-medium hover:text-ink transition disabled:opacity-50"
        >
          {pending ? 'Deshaciendo…' : 'Deshacer · marcar como pendiente'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/sesion/${userSessionId}/checkin`}
        className="w-full py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight text-center hover:bg-trail-deep transition"
      >
        Hice esta sesión →
      </Link>
      <button
        type="button"
        onClick={onQuickDone}
        disabled={pending}
        className="py-3 text-[13px] text-muted font-medium hover:text-ink transition disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Saltar check-in · marcar hecha'}
      </button>
    </div>
  )
}
