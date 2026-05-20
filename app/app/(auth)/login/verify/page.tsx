import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogoMark } from '@/components/brand/logo-mark'
import { OtpForm } from '@/components/auth/otp-form'

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyPage({ searchParams }: Props) {
  const { email } = await searchParams
  if (!email) redirect('/login/email')

  return (
    <>
      <Link
        href="/login/email"
        className="inline-flex items-center gap-1 text-sm text-muted font-medium mb-6 -ml-1"
      >
        <span aria-hidden>←</span> Volver
      </Link>

      <LogoMark className="w-12 h-12 text-trail mb-9" />

      <h1 className="text-[26px] font-extrabold tracking-tight text-ink leading-[1.1] mb-2">
        Revisá tu email
      </h1>
      <p className="text-sm text-muted mb-9">
        Te mandamos un código a <strong className="text-ink">{email}</strong>.
      </p>

      <OtpForm email={email} />
    </>
  )
}
