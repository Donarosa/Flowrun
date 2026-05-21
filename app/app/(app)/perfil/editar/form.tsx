'use client'

import { useState, useTransition } from 'react'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'
import type {
  EffortMode,
  Gender,
  PerceivedBase,
} from '@/types/database'
import { updateProfile } from './actions'

type Initial = {
  name: string
  age: number | null
  country: string
  gender: Gender | null
  perceivedBase: PerceivedBase | null
  effortMode: EffortMode | null
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' },
]

const SENSACION_OPTIONS: { value: PerceivedBase; label: string }[] = [
  { value: 'low', label: 'Me canso rápido' },
  { value: 'medium', label: 'Variable' },
  { value: 'solid', label: 'Estoy fuerte' },
]

const EFFORT_OPTIONS: { value: EffortMode; label: string }[] = [
  { value: 'talk_test', label: 'Conversación' },
  { value: 'rpe', label: 'RPE 1–5' },
  { value: 'hr', label: 'Frecuencia cardíaca' },
]

export function EditarForm({ initial }: { initial: Initial }) {
  const [name, setName] = useState(initial.name)
  const [age, setAge] = useState<string>(initial.age?.toString() ?? '')
  const [country, setCountry] = useState(initial.country || DEFAULT_COUNTRY)
  const [gender, setGender] = useState<Gender | null>(initial.gender)
  const [perceivedBase, setPerceivedBase] = useState<PerceivedBase | null>(
    initial.perceivedBase
  )
  const [effortMode, setEffortMode] = useState<EffortMode | null>(
    initial.effortMode
  )
  const [pending, startTransition] = useTransition()

  const ageNum = Number.parseInt(age, 10)
  const valid =
    name.trim().length > 0 &&
    Number.isInteger(ageNum) &&
    ageNum >= 12 &&
    ageNum <= 120 &&
    country.length === 2 &&
    gender !== null &&
    perceivedBase !== null &&
    effortMode !== null

  const onSubmit = () => {
    if (!valid || !gender || !perceivedBase || !effortMode) return
    startTransition(async () => {
      await updateProfile({
        name: name.trim(),
        age: ageNum,
        country,
        gender,
        perceivedBase,
        effortMode,
      })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Section title="Sobre vos">
        <Field label="Nombre completo">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-paper-2 text-ink text-[15px] ring-1 ring-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-trail)] transition"
          />
        </Field>
        <Field label="Edad">
          <input
            type="number"
            inputMode="numeric"
            min={12}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-paper-2 text-ink text-[15px] ring-1 ring-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-trail)] transition"
          />
        </Field>
        <Field label="País">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-paper-2 text-ink text-[15px] ring-1 ring-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-trail)] transition"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Género">
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <ChipButton
                key={opt.value}
                label={opt.label}
                selected={gender === opt.value}
                onSelect={() => setGender(opt.value)}
              />
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Preferencias">
        <Field label="Sensación al correr">
          <div className="flex flex-col gap-2">
            {SENSACION_OPTIONS.map((opt) => (
              <ChipButton
                key={opt.value}
                label={opt.label}
                selected={perceivedBase === opt.value}
                onSelect={() => setPerceivedBase(opt.value)}
                fullWidth
              />
            ))}
          </div>
        </Field>
        <Field label="Mido el esfuerzo con">
          <div className="flex flex-col gap-2">
            {EFFORT_OPTIONS.map((opt) => (
              <ChipButton
                key={opt.value}
                label={opt.label}
                selected={effortMode === opt.value}
                onSelect={() => setEffortMode(opt.value)}
                fullWidth
              />
            ))}
          </div>
        </Field>
      </Section>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!valid || pending}
        className="mt-2 py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-trail font-bold px-1">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted font-semibold">
        {label}
      </span>
      {children}
    </label>
  )
}

function ChipButton({
  label,
  selected,
  onSelect,
  fullWidth = false,
}: {
  label: string
  selected: boolean
  onSelect: () => void
  fullWidth?: boolean
}) {
  const base = fullWidth ? 'text-left px-4 py-3' : 'px-3 py-3'
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? `${base} rounded-xl text-[13.5px] font-semibold text-ink bg-trail-tint ring-2 ring-[var(--color-trail)] transition`
          : `${base} rounded-xl text-[13.5px] font-semibold text-ink bg-paper-2 ring-1 ring-[var(--color-border)] hover:bg-cream transition`
      }
    >
      {label}
    </button>
  )
}
