'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-alert)] mb-2">
        Error · server
      </p>
      <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] mb-4">
        Algo se rompió cargando esta página
      </h1>
      <pre className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 text-[12px] text-[var(--color-fg)] whitespace-pre-wrap overflow-x-auto mb-4">
        {error.message}
        {error.digest ? `\n\ndigest: ${error.digest}` : ''}
        {error.stack ? `\n\n${error.stack}` : ''}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-[var(--color-trail)] text-[var(--color-bg)] text-[13px] font-semibold"
      >
        Reintentar
      </button>
    </div>
  )
}
