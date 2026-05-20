'use client'

import { useState } from 'react'
import { OptionCard } from '@/components/onboarding/option-card'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { setSensacion, type SensacionChoice } from '../actions'

export default function SensacionPage() {
  const [choice, setChoice] = useState<SensacionChoice | null>(null)
  const [loading, setLoading] = useState(false)

  const onContinue = async () => {
    if (!choice) return
    setLoading(true)
    await setSensacion(choice)
  }

  return (
    <>
      <ProgressBar step={4} total={5} />
      <div className="flex-1 px-6 pt-4 pb-5 flex flex-col">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-[1.15] mt-2 mb-2">
          ¿Qué te pasa cuando corrés?
        </h1>
        <p className="text-[13px] text-muted mb-6">
          Elegí lo que más se parece a tu experiencia hoy.
        </p>

        <div className="flex flex-col gap-2.5">
          <OptionCard
            icon="😮‍💨"
            label="Me canso rápido"
            selected={choice === 'tires_fast'}
            onSelect={() => setChoice('tires_fast')}
          />
          <OptionCard
            icon="🤕"
            label="Me lesiono fácil"
            selected={choice === 'injury_prone'}
            onSelect={() => setChoice('injury_prone')}
          />
          <OptionCard
            icon="⚡"
            label="Corro fuerte siempre"
            selected={choice === 'always_strong'}
            onSelect={() => setChoice('always_strong')}
          />
          <OptionCard
            icon="😐"
            label="Me cuesta disfrutar"
            selected={choice === 'no_enjoyment'}
            onSelect={() => setChoice('no_enjoyment')}
          />
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!choice || loading}
          className="mt-auto py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando…' : 'Continuar'}
        </button>
      </div>
    </>
  )
}
