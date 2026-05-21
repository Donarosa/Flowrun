import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getSessionById } from '@/lib/plan'
import { getSessionCheckin } from '@/lib/checkin'
import { CheckinForm } from './form'

type Params = Promise<{ id: string }>

export default async function CheckinPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await getUser()
  const session = await getSessionById(id, user!.id)
  if (!session) notFound()

  const existing = await getSessionCheckin(id)

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <Link
        href={`/sesion/${id}`}
        className="inline-flex items-center gap-1 text-[13px] text-muted font-medium mb-4 hover:text-ink transition"
      >
        <span aria-hidden>←</span> Volver
      </Link>

      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-trail font-semibold mb-2">
        Check-in · 20 segundos
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-1">
        ¿Cómo te sentiste?
      </h1>
      <p className="text-[13px] text-muted mb-6">{session.name}</p>

      <CheckinForm
        userSessionId={id}
        initial={
          existing
            ? {
                rpe: existing.rpe,
                talkTest: existing.talk_test,
                breathing: existing.breathing,
                intent: existing.intent,
                notes: existing.notes ?? '',
              }
            : null
        }
      />
    </main>
  )
}
