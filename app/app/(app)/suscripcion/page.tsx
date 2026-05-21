import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { getSubscription, getAccessState } from '@/lib/subscription'
import { PlansGrid } from './plans-grid'

export default async function SuscripcionPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const profile = data!.profile
  const subscription = await getSubscription(user!.id)
  const access = getAccessState(subscription)
  const isArgentina = profile.country === 'AR'

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-trail font-semibold mb-2">
        Suscripción
      </p>

      {access.status === 'trial' && (
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-2">
          Estás probando FlowRun
        </h1>
      )}
      {access.status === 'paid' && (
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-2">
          Tu plan está activo
        </h1>
      )}
      {access.status === 'expired' && (
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-2">
          Tu acceso terminó
        </h1>
      )}

      <p className="text-[13px] text-muted mb-7">
        {access.status === 'trial' &&
          `Te quedan ${access.daysLeft} día${access.daysLeft === 1 ? '' : 's'}. Elegí tu plan cuando quieras.`}
        {access.status === 'paid' &&
          `Renovás el ${formatDate(access.periodEnd)}. Si querés extender antes, comprá otro plan.`}
        {access.status === 'expired' &&
          'Elegí tu plan para volver a entrenar.'}
      </p>

      <PlansGrid isArgentina={isArgentina} />

      <p className="text-[12px] text-muted leading-relaxed mt-8 text-center">
        Pago seguro · cancelás cuando querés · sin contratos
      </p>
    </main>
  )
}

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
  const d = new Date(`${iso}T00:00:00Z`)
  return `${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]}`
}
