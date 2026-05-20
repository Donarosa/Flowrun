import Link from 'next/link'
import { LogoMark } from '@/components/brand/logo-mark'
import { GoogleButton } from '@/components/auth/google-button'

export default function LoginPage() {
  return (
    <>
      <LogoMark className="w-12 h-12 text-trail mb-9" />

      <h1 className="text-[26px] font-extrabold tracking-tight text-ink leading-[1.1] mb-2">
        Creá tu cuenta
      </h1>
      <p className="text-sm text-muted mb-9">
        Tu plan se guarda y se adapta sesión a sesión.
      </p>

      <div className="flex flex-col gap-2.5">
        <GoogleButton />

        <div className="text-center font-mono text-[10px] tracking-[0.16em] uppercase text-soft my-4">
          o
        </div>

        <Link
          href="/login/email"
          className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-full bg-lichen text-ink font-semibold text-sm tracking-tight hover:bg-moss transition"
        >
          <MailIcon />
          Continuar con email
        </Link>
      </div>

      <p className="text-center text-[13px] text-muted mt-auto pt-12">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login/email" className="text-trail font-semibold">
          Iniciá sesión
        </Link>
      </p>
    </>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7l9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
