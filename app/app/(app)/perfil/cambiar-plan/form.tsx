'use client'

import { useState, useTransition } from 'react'
import { OptionCard } from '@/components/onboarding/option-card'
import type { ExperienceLevel, GoalType } from '@/types/database'
import { changePlan } from './actions'

type PistaValue = {
  experience: ExperienceLevel
  goal: GoalType
}

const PISTA_OPTIONS: {
  key: string
  experience: ExperienceLevel
  goal: GoalType
  icon: string
  label: string
  description: string
  variant?: 'pro'
}[] = [
  {
    key: 'zero',
    experience: 'new',
    goal: 'calle',
    icon: '🌱',
    label: 'Empezar a correr de cero',
    description: 'Nunca corrí o hace mucho que no corro',
  },
  {
    key: 'street_to_trail',
    experience: 'base',
    goal: 'calle_trail',
    icon: '🏙️',
    label: 'De la calle a la montaña',
    description: 'Ya corro en ciudad y quiero ir al trail',
  },
  {
    key: 'improve_trail',
    experience: 'base',
    goal: 'trail',
    icon: '⛰️',
    label: 'Mejorar en trail',
    description: 'Ya corro en montaña, quiero disfrutar más',
  },
  {
    key: 'advanced',
    experience: 'advanced',
    goal: 'trail',
    icon: '🔥',
    label: 'Planes Avanzados',
    description: 'Entrená con planes de élite',
    variant: 'pro',
  },
]

const DAYS_OPTIONS = [2, 3, 4] as const

export function CambiarPlanForm({
  initialExperienceLevel,
  initialGoalType,
  initialWeeklyDays,
}: {
  initialExperienceLevel: ExperienceLevel | null
  initialGoalType: GoalType | null
  initialWeeklyDays: number | null
}) {
  const matchedPista = PISTA_OPTIONS.find(
    (p) =>
      p.experience === initialExperienceLevel && p.goal === initialGoalType
  )
  const [pista, setPista] = useState<PistaValue | null>(
    matchedPista
      ? { experience: matchedPista.experience, goal: matchedPista.goal }
      : null
  )
  const [days, setDays] = useState<number | null>(initialWeeklyDays)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const changed =
    pista !== null &&
    days !== null &&
    (pista.experience !== initialExperienceLevel ||
      pista.goal !== initialGoalType ||
      days !== initialWeeklyDays)

  const onConfirm = () => {
    if (!pista || !days) return
    setError(null)
    startTransition(async () => {
      const res = await changePlan({
        experienceLevel: pista.experience,
        goalType: pista.goal,
        weeklyDays: days,
      })
      if (res && !res.ok) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-trail font-bold px-1">
          Pista
        </h2>
        <div className="flex flex-col gap-2.5">
          {PISTA_OPTIONS.map((p) => (
            <OptionCard
              key={p.key}
              icon={p.icon}
              label={p.label}
              description={p.description}
              selected={
                pista !== null &&
                pista.experience === p.experience &&
                pista.goal === p.goal
              }
              onSelect={() =>
                setPista({ experience: p.experience, goal: p.goal })
              }
              variant={p.variant}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-trail font-bold px-1">
          Días por semana
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {DAYS_OPTIONS.map((d) => {
            const selected = days === d
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={
                  selected
                    ? 'py-4 rounded-xl text-[15px] font-bold text-ink bg-trail-tint ring-2 ring-[var(--color-trail)] transition'
                    : 'py-4 rounded-xl text-[15px] font-bold text-ink bg-paper-2 ring-1 ring-[var(--color-border)] hover:bg-cream transition'
                }
              >
                {d} días
              </button>
            )
          })}
        </div>
      </section>

      {error && (
        <p className="text-[12.5px] text-terracotta-deep font-medium px-1">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={!changed || pending}
        className="mt-2 py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending
          ? 'Re-armando tu plan…'
          : changed
            ? 'Confirmar y re-armar plan'
            : 'Sin cambios'}
      </button>
    </div>
  )
}
