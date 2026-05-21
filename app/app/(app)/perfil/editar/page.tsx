import Link from 'next/link'
import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { EditarForm } from './form'

export default async function EditarPerfilPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const { profile, metrics } = data!

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-1 text-[13px] text-muted font-medium mb-4 hover:text-ink transition"
      >
        <span aria-hidden>←</span> Volver
      </Link>

      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted font-semibold mb-2">
        Editar perfil
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-tight mb-2">
        Ajustá tus datos
      </h1>
      <p className="text-[13px] text-muted mb-7">
        Para cambiar tu plan (pista o días), usá &ldquo;Cambiar mi plan&rdquo;
        desde tu perfil.
      </p>

      <EditarForm
        initial={{
          name: profile.name ?? '',
          age: profile.age ?? null,
          country: profile.country ?? 'AR',
          gender: profile.gender,
          perceivedBase: metrics.perceived_base,
          effortMode: metrics.preferred_effort_mode,
        }}
      />
    </main>
  )
}
