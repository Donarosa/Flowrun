'use client'

import Link from 'next/link'
import { useState } from 'react'
import { OptionCard } from '@/components/onboarding/option-card'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { setDestino, type DestinoChoice } from '../../actions'

export default function DestinoPage() {
  const [choice, setChoice] = useState<DestinoChoice | null>('calle')
  const [loading, setLoading] = useState(false)

  const onContinue = async () => {
    if (!choice) return
    setLoading(true)
    await setDestino(choice)
  }

  return (
    <>
      <ProgressBar step={2} total={5} />
      <Link
        href="/onboarding/pista"
        className="inline-flex items-center gap-1 text-[13px] text-muted font-medium px-5 pt-3.5"
      >
        <span aria-hidden>←</span> Volver
      </Link>
      <div className="flex-1 px-6 pt-3 pb-5 flex flex-col">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-[1.15] mt-2 mb-2">
          ¿Dónde te imaginás corriendo?
        </h1>
        <p className="text-[13px] text-muted mb-6">
          Empezamos igual los dos. Cambia hacia dónde te lleva.
        </p>

        <div className="flex flex-col gap-2.5">
          <OptionCard
            icon="🏙️"
            label="En calle / ciudad"
            description="Te llevamos a correr 30 min seguidos sin lesionarte"
            selected={choice === 'calle'}
            onSelect={() => setChoice('calle')}
          />
          <OptionCard
            icon="⛰️"
            label="En montaña / trail"
            description="Mismo arranque + preparación específica para terreno"
            selected={choice === 'calle_trail'}
            onSelect={() => setChoice('calle_trail')}
          />
        </div>

        <div className="bg-lichen rounded-2xl p-4 mt-5 flex gap-2.5 items-start">
          <span className="text-base">🟢</span>
          <p className="text-[12.5px] leading-snug text-pine">
            Las primeras 8 semanas son iguales: caminata + trote progresivo. La
            diferencia viene cuando ya podés correr 30 min.
          </p>
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
