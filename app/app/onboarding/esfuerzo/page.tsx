'use client'

import { useState } from 'react'
import { OptionCard } from '@/components/onboarding/option-card'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { LoadingScreen } from '@/components/brand/loading-screen'
import { setEsfuerzo } from '../actions'
import type { EffortMode } from '@/types/database'

export default function EsfuerzoPage() {
  const [choice, setChoice] = useState<EffortMode | null>(null)
  const [loading, setLoading] = useState(false)

  const onContinue = async () => {
    if (!choice) return
    setLoading(true)
    await setEsfuerzo(choice)
  }

  if (loading) {
    return <LoadingScreen overlay message="Armando tu plan…" />
  }

  return (
    <>
      <ProgressBar step={5} total={5} />
      <div className="flex-1 px-6 pt-4 pb-5 flex flex-col">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-[1.15] mt-2 mb-2">
          ¿Cómo querés medir tu esfuerzo?
        </h1>
        <p className="text-[13px] text-muted mb-6">
          Vas a usar esto en cada sesión. Podés cambiarlo después.
        </p>

        <div className="flex flex-col gap-2.5">
          <OptionCard
            icon="💬"
            label="Conversación"
            description="Recomendado · sin reloj, sin números"
            selected={choice === 'talk_test'}
            onSelect={() => setChoice('talk_test')}
          />
          <OptionCard
            icon="📊"
            label="RPE (1–5)"
            description="Esfuerzo percibido en escala simple"
            selected={choice === 'rpe'}
            onSelect={() => setChoice('rpe')}
          />
          <OptionCard
            icon="⌚"
            label="Tengo zona 2 en mi reloj"
            description="Configuramos Z1/Z2 con tu FCmax"
            selected={choice === 'hr'}
            onSelect={() => setChoice('hr')}
          />
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!choice || loading}
          className="mt-auto py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Armando tu plan…' : 'Armar mi plan →'}
        </button>
      </div>
    </>
  )
}
