'use client'

import { useState } from 'react'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { setDias } from '../actions'

type Days = 2 | 3 | 4

export default function DiasPage() {
  const [days, setDays] = useState<Days | null>(null)
  const [loading, setLoading] = useState(false)

  const onContinue = async () => {
    if (!days) return
    setLoading(true)
    await setDias(days)
  }

  return (
    <>
      <ProgressBar step={3} total={5} />
      <div className="flex-1 px-6 pt-4 pb-5 flex flex-col">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink leading-[1.15] mt-2 mb-2">
          ¿Cuántos días podés entrenar?
        </h1>
        <p className="text-[13px] text-muted mb-6">
          Sé honesto. Mejor 3 días reales que 5 imaginarios.
        </p>

        <div className="grid grid-cols-3 gap-2.5">
          {([2, 3, 4] as Days[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`py-7 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer ${
                days === d
                  ? 'bg-trail-tint shadow-[inset_0_0_0_2px_var(--color-trail)]'
                  : 'bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream'
              }`}
            >
              <span className="text-[32px] font-extrabold tracking-tight text-ink leading-none">
                {d === 4 ? '4+' : d}
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted font-semibold mt-1">
                días
              </span>
            </button>
          ))}
        </div>

        <div className="bg-lichen rounded-2xl p-4 mt-5 flex gap-2.5 items-start">
          <span className="text-base">💡</span>
          <p className="text-[12.5px] leading-snug text-pine">
            Con 3 días tenés el plan estándar. Si después podés sumar uno, lo
            agregamos automáticamente.
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!days || loading}
          className="mt-auto py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando…' : 'Continuar'}
        </button>
      </div>
    </>
  )
}
