import { login } from './actions'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const sp = await searchParams
  const next = sp.next ?? '/'
  const hasError = sp.error === '1'

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2">
          FlowRun · Admin
        </p>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] mb-1">
          Ingresar
        </h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">
          Panel interno · acceso por contraseña
        </p>

        <form action={login} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Contraseña"
            className="w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-soft)] outline-none focus:border-[var(--color-trail)]"
          />
          {hasError && (
            <p className="text-[12.5px] text-[var(--color-alert)]">
              Contraseña incorrecta.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--color-trail)] text-[var(--color-bg)] font-semibold text-[14px] py-3 hover:brightness-110 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
