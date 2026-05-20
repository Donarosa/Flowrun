type Props = {
  className?: string
}

export function LogoMark({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
      <path
        d="M 14 84 L 72 80 C 88 79 88 63 72 62 L 28 58 C 12 57 12 41 28 40 L 72 36 C 88 35 88 19 72 18 L 42 14"
        stroke="currentColor"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={42} cy={14} r={5} fill="currentColor" />
    </svg>
  )
}
