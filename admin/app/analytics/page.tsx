import { getAnalytics, type GAData } from '@/lib/ga'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  let data: GAData | null = null
  let error: string | null = null
  try {
    data = await getAnalytics()
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] mb-1">
          Analytics
        </h1>
        <p className="text-[13px] text-[var(--color-muted)]">
          Google Analytics 4 · vistas, audiencia y conversiones de la landing
        </p>
      </div>

      {error ? (
        <ConfigNeeded error={error} />
      ) : data ? (
        <>
          <Section title="Vistas (pageviews)">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label="Últimos 7 días" value={data.views7} accent="trail" />
              <Metric label="Últimos 28 días" value={data.views28} accent="trail" />
              <Metric label="Total (histórico)" value={data.viewsTotal} />
            </div>
          </Section>

          <Section title="Audiencia (28 días)">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Usuarios activos" value={data.users28} />
              <Metric label="Sesiones" value={data.sessions28} />
            </div>
          </Section>

          <Section title="Conversión · clic a la app (cta_app_click)">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="7 días" value={data.cta7} accent="trail" />
              <Metric label="28 días" value={data.cta28} accent="trail" />
            </div>
          </Section>

          <Section title="Top páginas (28 días)">
            <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
              {data.topPages.length === 0 ? (
                <p className="px-4 py-3.5 text-[13px] text-[var(--color-muted)]">Sin datos todavía.</p>
              ) : (
                data.topPages.map((p, i) => (
                  <div
                    key={p.path}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i > 0 ? 'border-t border-[var(--color-border)]' : ''
                    }`}
                  >
                    <span className="font-mono text-[12.5px] text-[var(--color-ink)] truncate pr-4">
                      {p.path}
                    </span>
                    <span className="text-[14px] font-semibold tabular-nums text-[var(--color-trail)]">
                      {p.views}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Section>

          <p className="text-[11px] text-[var(--color-soft)] font-mono">
            Datos en vivo del GA4 Data API (propiedad {process.env.GA_PROPERTY_ID || '540275671'}).
          </p>
        </>
      ) : null}
    </div>
  )
}

function ConfigNeeded({ error }: { error: string }) {
  const missing = error === 'GA_CREDS_MISSING'
  return (
    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-5 py-5 max-w-2xl">
      <p className="text-[14px] font-semibold text-[var(--color-ink)] mb-2">
        {missing ? 'Falta conectar Google Analytics' : 'Error al consultar GA4'}
      </p>
      {missing ? (
        <ol className="text-[13px] text-[var(--color-muted)] leading-relaxed list-decimal pl-5 flex flex-col gap-1.5">
          <li>Creá un service account en Google Cloud y activá el "Analytics Data API".</li>
          <li>
            En GA4 → Admin → Acceso a la propiedad, agregá el email del service account como{' '}
            <strong className="text-[var(--color-ink)]">Lector</strong>.
          </li>
          <li>
            Seteá en Vercel (flowrun-admin) las env vars{' '}
            <code className="font-mono text-[12px]">GA_SA_CLIENT_EMAIL</code> y{' '}
            <code className="font-mono text-[12px]">GA_SA_PRIVATE_KEY</code>.
          </li>
        </ol>
      ) : (
        <p className="font-mono text-[12px] text-[var(--color-alert)] break-words">{error}</p>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
  accent?: 'trail' | 'muted'
}) {
  const valueColor =
    accent === 'trail'
      ? 'text-[var(--color-trail)]'
      : accent === 'muted'
        ? 'text-[var(--color-muted)]'
        : 'text-[var(--color-ink)]'
  return (
    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3.5">
      <p className="text-[11px] text-[var(--color-muted)] mb-1.5 tracking-[-0.005em]">{label}</p>
      <p className={`text-[24px] font-semibold tracking-[-0.02em] tabular-nums ${valueColor}`}>
        {value.toLocaleString('es-AR')}
      </p>
    </div>
  )
}
