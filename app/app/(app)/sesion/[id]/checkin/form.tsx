'use client'

import { useState } from 'react'
import type {
  BreathingLevel,
  LegsFatigueLevel,
  SessionIntent,
  TalkTestLevel,
} from '@/types/database'
import { saveCheckin } from '../../actions'

type Initial = {
  rpe: number
  talkTest: TalkTestLevel
  breathing: BreathingLevel
  intent: SessionIntent
  pain: boolean
  legsFatigue: LegsFatigueLevel | null
  notes: string
} | null

const RPE_LABELS = [
  'Muy fácil',
  'Cómodo',
  'Moderado',
  'Duro',
  'Muy duro',
] as const

const TALK_OPTIONS: { value: TalkTestLevel; label: string; sub: string }[] = [
  { value: 'phrases', label: 'Frases completas', sub: 'Podía conversar' },
  { value: 'words', label: 'Solo palabras', sub: 'Apenas algunas' },
  { value: 'none', label: 'No pude hablar', sub: 'Demasiado esfuerzo' },
]

const BREATHING_OPTIONS: {
  value: BreathingLevel
  label: string
  sub: string
}[] = [
  { value: 'easy', label: 'Cómoda', sub: 'Casi como en reposo' },
  { value: 'medium', label: 'Media', sub: 'Notable pero controlada' },
  { value: 'hard', label: 'Agitada', sub: 'Costaba recuperar' },
]

const INTENT_OPTIONS: { value: SessionIntent; label: string; sub: string }[] = [
  { value: 'disfrutar', label: 'Disfrutar', sub: 'Sin presión' },
  { value: 'mejorar', label: 'Mejorar', sub: 'Buscar progreso' },
  { value: 'trail', label: 'Trail', sub: 'Específico de terreno' },
]

const FATIGUE_OPTIONS: {
  value: LegsFatigueLevel
  label: string
  sub: string
}[] = [
  { value: 'low', label: 'Baja', sub: 'Piernas frescas' },
  { value: 'medium', label: 'Media', sub: 'Algo cargadas' },
  { value: 'high', label: 'Alta', sub: 'Muy cargadas' },
]

export function CheckinForm({
  userSessionId,
  initial,
}: {
  userSessionId: string
  initial: Initial
}) {
  const [rpe, setRpe] = useState<number | null>(initial?.rpe ?? null)
  const [talkTest, setTalkTest] = useState<TalkTestLevel | null>(
    initial?.talkTest ?? null
  )
  const [breathing, setBreathing] = useState<BreathingLevel | null>(
    initial?.breathing ?? null
  )
  const [intent, setIntent] = useState<SessionIntent | null>(
    initial?.intent ?? null
  )
  const [pain, setPain] = useState<boolean | null>(initial?.pain ?? null)
  const [legsFatigue, setLegsFatigue] = useState<LegsFatigueLevel | null>(
    initial?.legsFatigue ?? null
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [loading, setLoading] = useState(false)

  const valid =
    rpe !== null &&
    talkTest &&
    breathing &&
    intent &&
    pain !== null &&
    legsFatigue

  const onSubmit = async () => {
    if (
      !valid ||
      !rpe ||
      !talkTest ||
      !breathing ||
      !intent ||
      pain === null ||
      !legsFatigue
    )
      return
    setLoading(true)
    await saveCheckin({
      userSessionId,
      rpe,
      talkTest,
      breathing,
      intent,
      pain,
      legsFatigue,
      notes,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Sensación general"
        helper={rpe ? `${rpe}/5 · ${RPE_LABELS[rpe - 1]}` : '1 = muy fácil · 5 = muy duro'}
      >
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const selected = rpe === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRpe(n)}
                className={`py-3 rounded-xl text-[15px] font-bold transition ${
                  selected
                    ? 'bg-trail text-white'
                    : 'bg-paper-2 text-ink shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream'
                }`}
              >
                {n}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="¿Podías hablar?">
        <OptionGroup
          options={TALK_OPTIONS}
          value={talkTest}
          onSelect={setTalkTest}
        />
      </Field>

      <Field label="¿Cómo respirabas?">
        <OptionGroup
          options={BREATHING_OPTIONS}
          value={breathing}
          onSelect={setBreathing}
        />
      </Field>

      <Field label="Objetivo de hoy">
        <OptionGroup
          options={INTENT_OPTIONS}
          value={intent}
          onSelect={setIntent}
        />
      </Field>

      <Field label="¿Tuviste dolor o molestia?">
        <div className="grid grid-cols-2 gap-2">
          <PainButton
            value={false}
            label="No"
            selected={pain === false}
            onSelect={() => setPain(false)}
          />
          <PainButton
            value={true}
            label="Sí"
            selected={pain === true}
            onSelect={() => setPain(true)}
          />
        </div>
      </Field>

      <Field label="Fatiga en piernas">
        <OptionGroup
          options={FATIGUE_OPTIONS}
          value={legsFatigue}
          onSelect={setLegsFatigue}
        />
      </Field>

      <Field label="Notas" helper="Opcional">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Algo que quieras recordar…"
          className="w-full px-4 py-3 rounded-xl bg-paper-2 text-ink text-[14px] placeholder:text-muted shadow-[inset_0_0_0_1px_var(--color-border)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-trail)] transition resize-none"
        />
      </Field>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!valid || loading}
        className="mt-4 py-4 rounded-full bg-trail text-white font-semibold text-[15px] tracking-tight hover:bg-trail-deep transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Guardando…'
          : initial
            ? 'Actualizar check-in'
            : 'Guardar y marcar hecha'}
      </button>
    </div>
  )
}

function PainButton({
  value,
  label,
  selected,
  onSelect,
}: {
  value: boolean
  label: string
  selected: boolean
  onSelect: () => void
}) {
  let className =
    'py-3 rounded-xl text-[14px] font-semibold transition bg-paper-2 text-ink ring-1 ring-[var(--color-border)] hover:bg-cream'
  if (selected && value) {
    className =
      'py-3 rounded-xl text-[14px] font-semibold transition bg-terracotta-tint text-terracotta-deep ring-2 ring-[var(--color-terracotta)]'
  } else if (selected && !value) {
    className =
      'py-3 rounded-xl text-[14px] font-semibold transition bg-trail-tint text-ink ring-2 ring-[var(--color-trail)]'
  }
  return (
    <button type="button" onClick={onSelect} className={className}>
      {label}
    </button>
  )
}

function Field({
  label,
  helper,
  children,
}: {
  label: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted font-semibold">
          {label}
        </span>
        {helper && (
          <span className="text-[11px] text-muted">{helper}</span>
        )}
      </div>
      {children}
    </label>
  )
}

function OptionGroup<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { value: T; label: string; sub: string }[]
  value: T | null
  onSelect: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`text-left px-4 py-3 rounded-xl transition ${
              selected
                ? 'bg-trail-tint shadow-[inset_0_0_0_2px_var(--color-trail)]'
                : 'bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream'
            }`}
          >
            <div className="text-[14px] font-semibold text-ink">
              {opt.label}
            </div>
            <div className="text-[12px] text-muted leading-snug">
              {opt.sub}
            </div>
          </button>
        )
      })}
    </div>
  )
}
