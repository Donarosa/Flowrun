'use client'

import { useState } from 'react'
import { OptionCard } from '@/components/onboarding/option-card'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { setPista, type PistaChoice } from '../actions'

export default function PistaPage() {
  const [choice, setChoice] = useState<PistaChoice | null>(null)
  const [loading, setLoading] = useState(false)

  const onContinue = async () => {
    if (!choice) return
    setLoading(true)
    await setPista(choice)
  }

  return (
    <>
      <ProgressBar step={2} total={5} />
      <div className="flex-1 px-6 pt-4 pb-5 flex flex-col">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-[1.15] mt-2 mb-2">
          ¿Qué querés hacer?
        </h1>
        <p className="text-[13px] text-muted mb-6">
          Elegí la opción que mejor te describe.
        </p>

        <div className="flex flex-col gap-2.5">
          <OptionCard
            icon="🌱"
            label="Empezar a correr de cero"
            description="Nunca corrí o hace mucho que no corro"
            selected={choice === 'zero'}
            onSelect={() => setChoice('zero')}
          />
          <OptionCard
            icon="🏙️"
            label="De la calle a la montaña"
            description="Ya corro en ciudad y quiero ir al trail"
            selected={choice === 'street_to_trail'}
            onSelect={() => setChoice('street_to_trail')}
          />
          <OptionCard
            icon="⛰️"
            label="Mejorar en trail"
            description="Ya corro en montaña, quiero disfrutar más"
            selected={choice === 'improve_trail'}
            onSelect={() => setChoice('improve_trail')}
          />
          <OptionCard
            icon="🔥"
            label="Planes Avanzados"
            description={
              <>
                Entrená con los planes de <strong>Sarah</strong>, campeona del
                mundo de trail
              </>
            }
            selected={choice === 'advanced'}
            onSelect={() => setChoice('advanced')}
            variant="pro"
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
