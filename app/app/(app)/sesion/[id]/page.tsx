import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/supabase/get-user'
import { getSessionById } from '@/lib/plan'
import { SessionActions } from './actions-client'

const DAYS_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]
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

function formatLongDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return `${DAYS_ES[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]}`
}

type Params = Promise<{ id: string }>

export default async function SessionPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await getUser()
  const session = await getSessionById(id, user!.id)
  if (!session) notFound()

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <Link
        href="/plan"
        className="inline-flex items-center gap-1 text-[13px] text-muted font-medium mb-4 hover:text-ink transition"
      >
        <span aria-hidden>←</span> Volver al plan
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-trail font-bold">
          Semana {session.weekNumber}
        </span>
        {session.isDeload && (
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-stone font-semibold">
            · Descarga
          </span>
        )}
        {session.status === 'completed' && (
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-pine font-bold ml-auto">
            ✓ Hecha
          </span>
        )}
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-1">
        {session.name}
      </h1>
      <p className="text-[13px] text-muted mb-2">
        {formatLongDate(session.scheduledDate)}
      </p>
      <p className="text-[13px] text-muted mb-6">
        {session.totalDurationMin} minutos en total
      </p>

      <ul className="flex flex-col gap-3 mb-8">
        {session.blocks.map((b, i) => (
          <li
            key={`${b.code}-${i}`}
            className="bg-paper-2 rounded-2xl p-4 shadow-[inset_0_0_0_1px_var(--color-border)]"
          >
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="font-mono text-[11px] tracking-[0.04em] text-trail font-bold">
                {b.code}
              </span>
              <span className="text-[15px] font-semibold text-ink flex-1">
                {b.name}
              </span>
              <span className="text-[13px] font-semibold text-ink tabular-nums">
                {b.durationMin}′
              </span>
            </div>
            {b.description && (
              <p className="text-[12.5px] text-muted leading-relaxed mb-2">
                {b.description}
              </p>
            )}
            {b.note && (
              <div className="bg-cream rounded-xl px-3 py-2 mt-2">
                <p className="text-[12.5px] text-ink leading-snug">{b.note}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      <SessionActions
        userSessionId={session.userSessionId}
        status={session.status}
      />
    </main>
  )
}
