import Link from 'next/link'
import { LogoMark } from '@/components/brand/logo-mark'
import { EmailForm } from '@/components/auth/email-form'

export default function EmailLoginPage() {
  return (
    <>
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-muted font-medium mb-6 -ml-1"
      >
        <span aria-hidden>←</span> Volver
      </Link>

      <LogoMark className="w-12 h-12 text-trail mb-9" />

      <h1 className="text-[26px] font-extrabold tracking-tight text-ink leading-[1.1] mb-2">
        Entrá con tu email
      </h1>
      <p className="text-sm text-muted mb-9">
        Te mandamos un código de 6 dígitos para confirmar.
      </p>

      <EmailForm />
    </>
  )
}
