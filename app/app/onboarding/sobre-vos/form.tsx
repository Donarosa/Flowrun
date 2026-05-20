'use client'

import { useState } from 'react'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'
import type { Gender } from '@/types/database'
import { setSobreVos } from '../actions'

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' },
]

type Props = {
  initialName: string
  initialAge: number | null
  initialCountry: string | null
  initialGender: Gender | null
}

export function SobreVosForm({
  initialName,
  initialAge,
  initialCountry,
  initialGender,
}: Props) {
  const [name, setName] = useState(initialName)
  const [age, setAge] = useState<string>(initialAge?.toString() ?? '')
  const [country, setCountry] = useState(initialCountry ?? DEFAULT_COUNTRY)
  const [gender, setGender] = useState<Gender | null>(initialGender)
  const [loading, setLoading] = useState(false)

  const ageNum = Number.parseInt(age, 10)
  const valid =
    name.trim().length > 0 &&
    Number.isInteger(ageNum) &&
    ageNum >= 12 &&
    ageNum <= 120 &&
    country.length === 2 &&
    gender !== null

  const onContinue = async () => {
    if (!valid || !gender) return
    setLoading(true)
    await setSobreVos({
      name: name.trim(),
      age: ageNum,
      country,
      gender,
    })
  }

  return (
    <>
      <ProgressBar step={1} total={5} />
      <div className="flex-1 px-6 pt-4 pb-5 flex flex-col">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-[1.15] mt-2 mb-2">
          Sobre vos
        </h1>
        <p className="text-[13px] text-muted mb-6">
          Pocos datos, una sola vez. Para personalizar tu plan.
        </p>

        <div className="flex flex-col gap-4">
          <Field label="Nombre completo">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Tu nombre y apellido"
              className="w-full px-4 py-3 rounded-xl bg-paper-2 text-ink text-[15px] placeholder:text-muted shadow-[inset_0_0_0_1px_var(--color-border)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-trail)] transition"
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
              placeholder="35"
              className="w-full px-4 py-3 rounded-xl bg-paper-2 text-ink text-[15px] placeholder:text-muted shadow-[inset_0_0_0_1px_var(--color-border)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-trail)] transition"
            />
          </Field>

          <Field label="País">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-paper-2 text-ink text-[15px] shadow-[inset_0_0_0_1px_var(--color-border)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-trail)] transition appearance-none"
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
              {GENDER_OPTIONS.map((opt) => {
                const selected = gender === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    className={`px-3 py-3 rounded-xl text-[13.5px] font-semibold tracking-tight transition ${
                      selected
                        ? 'bg-trail-tint shadow-[inset_0_0_0_2px_var(--color-trail)] text-ink'
                        : 'bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] text-ink hover:bg-cream'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!valid || loading}
          className="mt-auto py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando…' : 'Continuar'}
        </button>
      </div>
    </>
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
