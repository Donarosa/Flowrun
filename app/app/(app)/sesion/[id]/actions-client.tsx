'use client'

import { useState, useTransition } from 'react'
import type { SessionStatus } from '@/types/database'
import { markSessionDone, markSessionPending } from '../actions'

type Props = {
  userSessionId: string
  status: SessionStatus
}

export function SessionActions({ userSessionId, status }: Props) {
  const [pending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useState(status)

  const done = optimisticStatus === 'completed'

  const onToggle = () => {
    const next: SessionStatus = done ? 'pending' : 'completed'
    setOptimisticStatus(next)
    startTransition(async () => {
      try {
        if (done) {
          await markSessionPending(userSessionId)
        } else {
          await markSessionDone(userSessionId)
        }
      } catch {
        setOptimisticStatus(status)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className={
        done
          ? 'w-full py-4 rounded-full bg-paper-2 text-ink font-semibold text-[15px] tracking-tight shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream transition disabled:opacity-60'
          : 'w-full py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-60'
      }
    >
      {pending ? 'Guardando…' : done ? '✓ Hecha · Tocar para deshacer' : 'Marcar como hecha'}
    </button>
  )
}
