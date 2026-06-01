import Link from 'next/link'

export default function InstalarPage() {
  return (
    <main className="px-7 pt-2 pb-10 max-w-md mx-auto w-full">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-1 text-[13px] text-muted font-medium mb-4 hover:text-ink transition"
      >
        <span aria-hidden>←</span> Volver
      </Link>

      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-trail font-semibold mb-2">
        Instalar
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink leading-tight mb-2">
        Tené FlowRun a mano
      </h1>
      <p className="text-[13.5px] text-muted leading-[1.5] mb-7">
        Agregá un acceso directo a tu pantalla de inicio. Entrás de un toque,
        sin pasar por el navegador.
      </p>

      <div className="flex flex-col gap-3">
        <PlatformDetails
          icon={<AppleIcon />}
          label="iPhone · Safari"
          steps={[
            (
              <>
                Tocá el botón <strong className="text-ink">Compartir</strong>{' '}
                <ShareIconInline /> en la barra de abajo.
              </>
            ),
            (
              <>
                Deslizá hacia abajo y tocá{' '}
                <strong className="text-ink">
                  Agregar a pantalla de inicio
                </strong>
                .
              </>
            ),
            (
              <>
                Tocá <strong className="text-ink">Agregar</strong> arriba a la
                derecha.
              </>
            ),
            (
              <>
                Listo: el ícono de FlowRun queda en tu pantalla de inicio.
              </>
            ),
          ]}
          note="Recomendado en iPhone. Si estás en otro navegador, mirá la opción de abajo."
        />

        <PlatformDetails
          icon={<AppleIcon />}
          label="iPhone · Chrome"
          steps={[
            (
              <>
                Tocá el menú{' '}
                <span aria-hidden className="font-bold text-ink">
                  ⋯
                </span>{' '}
                abajo a la derecha.
              </>
            ),
            (
              <>
                Tocá <strong className="text-ink">Compartir…</strong> (se abre
                el menú de iOS).
              </>
            ),
            (
              <>
                Deslizá y tocá{' '}
                <strong className="text-ink">
                  Agregar a pantalla de inicio
                </strong>
                .
              </>
            ),
            (
              <>
                Confirmá con <strong className="text-ink">Agregar</strong>{' '}
                arriba a la derecha.
              </>
            ),
          ]}
          note="Si no ves la opción, actualizá Chrome a la última versión desde la App Store."
        />

        <PlatformDetails
          icon={<AndroidIcon />}
          label="Android · Chrome"
          steps={[
            (
              <>
                Tocá el menú{' '}
                <span aria-hidden className="font-bold text-ink">
                  ⋮
                </span>{' '}
                arriba a la derecha.
              </>
            ),
            (
              <>
                Tocá{' '}
                <strong className="text-ink">
                  Agregar a pantalla principal
                </strong>{' '}
                o <strong className="text-ink">Instalar app</strong>.
              </>
            ),
            (
              <>
                Confirmá tocando{' '}
                <strong className="text-ink">Agregar</strong> o{' '}
                <strong className="text-ink">Instalar</strong>.
              </>
            ),
            (
              <>El ícono te queda en la pantalla principal.</>
            ),
          ]}
          note="También funciona desde Firefox y Samsung Internet con un menú parecido."
        />
      </div>

      <p className="mt-8 text-center text-[12px] text-muted leading-[1.5]">
        No descargás nada de la tienda. Es solo un acceso directo: ocupa cero
        espacio.
      </p>
    </main>
  )
}

function PlatformDetails({
  icon,
  label,
  steps,
  note,
}: {
  icon: React.ReactNode
  label: string
  steps: React.ReactNode[]
  note?: string
}) {
  return (
    <details className="group bg-paper-2 rounded-2xl shadow-[inset_0_0_0_1px_var(--color-border)] open:bg-paper-2 overflow-hidden">
      <summary className="flex items-center gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-cream transition">
        <span className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="flex-1 text-[15px] font-semibold text-ink tracking-[-0.012em]">
          {label}
        </span>
        <span
          aria-hidden
          className="font-mono text-[16px] text-muted font-light transition-transform group-open:rotate-90"
        >
          →
        </span>
      </summary>

      <div className="px-4 pb-4 pt-1 border-t border-border/60">
        <ol className="flex flex-col gap-2.5 mt-3">
          {steps.map((step, i) => (
            <li
              key={i}
              className="grid grid-cols-[26px_1fr] items-start gap-2 text-[13.5px] text-muted leading-[1.5]"
            >
              <span className="font-mono text-[11px] text-trail font-bold tracking-[0.04em] pt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {note && (
          <p className="mt-3.5 pt-3 border-t border-border/60 text-[12px] text-muted leading-[1.45] italic">
            {note}
          </p>
        )}
      </div>
    </details>
  )
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      className="text-ink"
      aria-hidden
    >
      <path d="M17.564 13.103c-.025-2.583 2.108-3.84 2.205-3.9-1.202-1.756-3.072-1.996-3.737-2.022-1.59-.16-3.105.937-3.913.937-.82 0-2.066-.913-3.397-.888-1.748.026-3.36 1.014-4.258 2.575-1.817 3.143-.464 7.793 1.305 10.343.866 1.247 1.898 2.647 3.252 2.597 1.31-.052 1.803-.843 3.387-.843 1.583 0 2.025.843 3.404.815 1.404-.024 2.294-1.264 3.151-2.519.994-1.444 1.404-2.846 1.428-2.918-.031-.013-2.736-1.05-2.764-4.166-.022-2.604 2.127-3.851 2.225-3.911-1.219-1.792-3.105-1.985-3.77-2.013zm-2.95-3.7c.722-.876 1.21-2.094 1.077-3.306-1.04.043-2.301.695-3.048 1.572-.668.775-1.255 2.019-1.098 3.21 1.162.089 2.348-.59 3.07-1.476z" />
    </svg>
  )
}

function AndroidIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="currentColor"
      className="text-trail"
      aria-hidden
    >
      <path d="M17.523 15.341a1.05 1.05 0 0 1-1.05-1.05c0-.58.47-1.05 1.05-1.05.58 0 1.05.47 1.05 1.05a1.05 1.05 0 0 1-1.05 1.05m-11.046 0a1.05 1.05 0 0 1-1.05-1.05c0-.58.47-1.05 1.05-1.05.58 0 1.05.47 1.05 1.05a1.05 1.05 0 0 1-1.05 1.05m11.422-6.022 2.098-3.633a.436.436 0 0 0-.159-.594.436.436 0 0 0-.594.159l-2.124 3.678C16.519 8.243 14.354 7.7 12 7.7s-4.519.543-6.12 1.229L3.756 5.251a.436.436 0 0 0-.594-.159.436.436 0 0 0-.159.594l2.098 3.633C1.493 11.236.029 14.026 0 16.969h24c-.029-2.943-1.493-5.733-5.101-7.65" />
    </svg>
  )
}

function ShareIconInline() {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[5px] bg-cream align-text-bottom -translate-y-px ml-0.5"
    >
      <svg
        viewBox="0 0 24 24"
        width="11"
        height="11"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-trail"
      >
        <path d="M12 3v12" />
        <path d="m8 7 4-4 4 4" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      </svg>
    </span>
  )
}
