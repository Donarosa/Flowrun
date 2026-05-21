import { getUser } from '@/lib/supabase/get-user'
import { getProfileWithMetrics } from '@/lib/profile'
import { LogoutButton } from '@/components/auth/logout-button'
import { COUNTRIES } from '@/lib/countries'
import type {
  EffortMode,
  ExperienceLevel,
  Gender,
  GoalType,
  PerceivedBase,
} from '@/types/database'

const GENDER_LABEL: Record<Gender, string> = {
  female: 'Femenino',
  male: 'Masculino',
  other: 'Otro',
  prefer_not_to_say: 'Prefiero no decirlo',
}

const PISTA_LABEL: Record<`${ExperienceLevel}_${GoalType}`, string> = {
  new_calle: 'Empezar a correr · calle',
  new_calle_trail: 'Empezar a correr · calle → trail',
  new_trail: 'Empezar a correr · trail',
  base_calle: 'Mejorar en calle',
  base_calle_trail: 'De la calle a la montaña',
  base_trail: 'Mejorar en trail',
  advanced_calle: 'Planes avanzados · calle',
  advanced_calle_trail: 'Planes avanzados',
  advanced_trail: 'Planes avanzados',
}

const EFFORT_LABEL: Record<EffortMode, string> = {
  talk_test: 'Conversación',
  rpe: 'RPE (1–5)',
  hr: 'Frecuencia cardíaca',
}

const SENSACION_LABEL: Record<PerceivedBase, string> = {
  low: 'Me canso rápido',
  medium: 'Variable',
  solid: 'Estoy fuerte',
}

function countryName(code: string | null): string {
  if (!code) return '—'
  return COUNTRIES.find((c) => c.code === code)?.name ?? code
}

export default async function PerfilPage() {
  const user = await getUser()
  const data = await getProfileWithMetrics(user!.id)
  const { profile, metrics } = data!

  const pistaKey =
    `${profile.experience_level}_${profile.goal_type}` as keyof typeof PISTA_LABEL
  const pista = PISTA_LABEL[pistaKey] ?? '—'

  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted font-semibold mb-2">
        Perfil
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink leading-tight mb-1">
        {profile.name ?? profile.email.split('@')[0]}
      </h1>
      <p className="text-[13px] text-muted mb-7">{profile.email}</p>

      <section className="mb-6">
        <SectionTitle>Sobre vos</SectionTitle>
        <div className="flex flex-col gap-2">
          <Row label="Edad" value={profile.age ? `${profile.age} años` : '—'} />
          <Row label="País" value={countryName(profile.country)} />
          <Row
            label="Género"
            value={profile.gender ? GENDER_LABEL[profile.gender] : '—'}
          />
        </div>
      </section>

      <section className="mb-6">
        <SectionTitle>Tu plan</SectionTitle>
        <div className="flex flex-col gap-2">
          <Row label="Pista" value={pista} />
          <Row
            label="Días por semana"
            value={profile.weekly_days ? `${profile.weekly_days} días` : '—'}
          />
          <Row
            label="Sensación al correr"
            value={
              metrics.perceived_base
                ? SENSACION_LABEL[metrics.perceived_base]
                : '—'
            }
          />
          <Row
            label="Mido el esfuerzo con"
            value={
              metrics.preferred_effort_mode
                ? EFFORT_LABEL[metrics.preferred_effort_mode]
                : '—'
            }
          />
        </div>
      </section>

      <div className="mt-10 flex justify-center">
        <LogoutButton />
      </div>
    </main>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-trail font-bold mb-3 px-1">
      {children}
    </h2>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-2 rounded-2xl px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-border)] flex items-center justify-between">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className="text-[14px] font-semibold text-ink text-right">
        {value}
      </span>
    </div>
  )
}
