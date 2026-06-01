import { getDashboardMetrics } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const m = await getDashboardMetrics()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] mb-1">
          Dashboard
        </h1>
        <p className="text-[13px] text-[var(--color-muted)]">
          Visión general · signups, suscripciones y revenue
        </p>
      </div>

      <Section title="Usuarios">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Signups totales" value={m.totalSignups} />
          <Metric label="En trial" value={m.trialActive} accent="warn" />
          <Metric label="Pagos activos" value={m.paidActive} accent="trail" />
          <Metric label="Vencidos" value={m.expired} accent="muted" />
        </div>
      </Section>

      <Section title="Crecimiento">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Signups · 7d" value={m.signupsLast7} />
          <Metric label="Signups · 30d" value={m.signupsLast30} />
          <Metric label="Pagos · 7d" value={m.paidLast7} accent="trail" />
          <Metric label="Pagos · 30d" value={m.paidLast30} accent="trail" />
        </div>
      </Section>

      <Section title="Revenue (suscripciones activas)">
        <div className="grid grid-cols-2 gap-3">
          <Metric
            label="ARS"
            value={`$${m.revenueArs.toLocaleString('es-AR')}`}
            accent="trail"
          />
          <Metric
            label="USD"
            value={`$${m.revenueUsd.toLocaleString('en-US')}`}
            accent="trail"
          />
        </div>
        <p className="text-[11px] text-[var(--color-soft)] mt-2 font-mono">
          Suma de `amount` en filas con status=active. No es revenue acumulado
          histórico — refleja MRR proyectado.
        </p>
      </Section>

      <Section title="Subs por status">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Trialing" value={m.trialActive} />
          <Metric label="Active" value={m.paidActive} accent="trail" />
          <Metric label="Canceled" value={m.canceled} accent="muted" />
          <Metric label="Expired" value={m.expired} accent="alert" />
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-3">
        {title}
      </p>
      {children}
    </section>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: 'trail' | 'warn' | 'alert' | 'muted'
}) {
  const valueColor =
    accent === 'trail'
      ? 'text-[var(--color-trail)]'
      : accent === 'warn'
        ? 'text-[var(--color-warn)]'
        : accent === 'alert'
          ? 'text-[var(--color-alert)]'
          : accent === 'muted'
            ? 'text-[var(--color-muted)]'
            : 'text-[var(--color-ink)]'

  return (
    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3.5">
      <p className="text-[11px] text-[var(--color-muted)] mb-1.5 tracking-[-0.005em]">
        {label}
      </p>
      <p
        className={`text-[24px] font-semibold tracking-[-0.02em] tabular-nums ${valueColor}`}
      >
        {value}
      </p>
    </div>
  )
}
