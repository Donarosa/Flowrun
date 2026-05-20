type Props = {
  step: number
  total: number
}

export function ProgressBar({ step, total }: Props) {
  const percent = Math.min(100, Math.max(0, (step / total) * 100))
  return (
    <div className="flex items-center gap-2 px-5 pt-5">
      <span className="font-mono text-[10px] tracking-[0.06em] text-muted font-semibold">
        {step}/{total}
      </span>
      <div className="flex-1 h-[3px] bg-hair rounded-full overflow-hidden">
        <div
          className="h-full bg-trail rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
