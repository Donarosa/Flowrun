import { getFunnelStages } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function FlujosPage() {
  const stages = await getFunnelStages()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] mb-1">
          Flujos
        </h1>
        <p className="text-[13px] text-[var(--color-muted)]">
          Funnel de activación basado en eventos en DB
        </p>
      </div>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-3">
          Activación
        </p>
        <ol className="flex flex-col gap-2">
          {stages.map((s, i) => {
            const isFirst = i === 0
            const dropFromPrev = isFirst
              ? null
              : stages[i - 1].count > 0
                ? Math.round(
                    ((stages[i - 1].count - s.count) / stages[i - 1].count) *
                      1000,
                  ) / 10
                : 0

            return (
              <li
                key={s.key}
                className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-4"
              >
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-[var(--color-muted)] tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[14px] font-medium text-[var(--color-ink)]">
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-[var(--color-muted)] tabular-nums">
                      {s.pct.toFixed(1)}%
                    </span>
                    <span className="text-[18px] font-semibold tabular-nums text-[var(--color-ink)] min-w-[3ch] text-right">
                      {s.count}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-trail)] transition-all"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                {dropFromPrev !== null && (
                  <p className="font-mono text-[10px] text-[var(--color-soft)] mt-2">
                    Drop vs paso anterior: {dropFromPrev.toFixed(1)}%
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        <p className="text-[11px] text-[var(--color-soft)] mt-4 font-mono leading-relaxed">
          Eventos derivados de tablas: profiles · user_sessions ·
          session_checkins · subscriptions. No incluye pageviews (no hay
          tracking instalado).
        </p>
      </section>
    </div>
  )
}
