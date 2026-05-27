import Link from 'next/link'
import { LogoMark } from '@/components/brand/logo-mark'
import { GoogleButton } from '@/components/auth/google-button'

export default function LoginPage() {
  return (
    <>
      <LogoMark className="w-[58px] h-[58px] text-trail mt-20 mb-[22px]" />

      <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-trail font-semibold mb-2 flex items-center gap-2.5">
        <span aria-hidden className="w-[18px] h-[1.5px] bg-trail rounded-[1px]" />
        Crear cuenta
      </p>

      <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-ink leading-[1.08] mb-2 text-balance">
        Empezá<br />donde estés.
      </h1>
      <p className="text-[13.5px] text-muted leading-[1.5] tracking-[-0.005em] mb-[30px]">
        Tu plan se guarda en la nube y se adapta sesión a sesión.
      </p>

      <GoogleButton />

      <div className="flex items-center gap-3 my-[18px] font-mono text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">
        <span aria-hidden className="flex-1 h-px bg-border" />
        <span>o</span>
        <span aria-hidden className="flex-1 h-px bg-border" />
      </div>

      <Link
        href="/login/email"
        className="w-full flex items-center justify-center gap-[11px] px-[18px] py-[14px] rounded-[14px] font-semibold text-[14.5px] tracking-[-0.012em] text-trail-deep border border-lichen-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-[0.98] transition"
        style={{
          background:
            'linear-gradient(180deg, var(--color-lichen) 0%, oklch(91% 0.02 145) 100%)',
        }}
      >
        <MailIcon />
        <span>Continuar con email</span>
      </Link>

      <div className="mt-auto pt-12 flex flex-col items-center gap-[18px]">
        <p className="text-[13px] text-muted tracking-[-0.005em]">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login/email" className="text-trail font-semibold">
            Iniciá sesión
          </Link>
        </p>
        <div className="flex items-center gap-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-soft font-semibold">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-trail" />
            Privacidad
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-trail" />
            Plan adaptativo
          </span>
        </div>
      </div>
    </>
  )
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}
