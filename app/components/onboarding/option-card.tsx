'use client'

import { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  label: string
  description?: ReactNode
  selected: boolean
  onSelect: () => void
  variant?: 'default' | 'pro'
}

export function OptionCard({
  icon,
  label,
  description,
  selected,
  onSelect,
  variant = 'default',
}: Props) {
  const base =
    'w-full text-left p-4 rounded-2xl flex items-start gap-3.5 transition cursor-pointer'
  const states = selected
    ? variant === 'pro'
      ? 'bg-pine text-white shadow-[inset_0_0_0_2px_var(--color-trail)]'
      : 'bg-trail-tint shadow-[inset_0_0_0_2px_var(--color-trail)]'
    : variant === 'pro'
      ? 'bg-pine-deep text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-pine'
      : 'bg-paper-2 shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-cream'

  const iconBg =
    variant === 'pro'
      ? 'bg-white/10'
      : selected
        ? 'bg-trail text-white'
        : 'bg-lichen'

  return (
    <button type="button" onClick={onSelect} className={`${base} ${states}`}>
      <div
        className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-xl shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold tracking-tight">{label}</div>
        {description && (
          <div className="text-[12.5px] leading-snug mt-0.5 opacity-80">
            {description}
          </div>
        )}
      </div>
    </button>
  )
}
