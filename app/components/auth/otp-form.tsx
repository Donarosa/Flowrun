'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  email: string
}

export function OtpForm({ email }: Props) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const onResend = async () => {
    setResending(true)
    setError(null)
    setInfo(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    setResending(false)
    if (error) {
      setError(error.message)
      return
    }
    setInfo('Te mandamos un código nuevo.')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted font-semibold">
        Código de 6 dígitos
      </label>
      <input
        ref={inputRef}
        type="text"
        required
        autoComplete="one-time-code"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        placeholder="······"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        disabled={loading}
        className="w-full px-4 py-3.5 rounded-2xl bg-paper-2 text-ink text-2xl tracking-[0.4em] text-center font-mono shadow-[inset_0_0_0_1px_var(--color-border)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-trail)] disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="mt-2 flex items-center justify-center py-3.5 px-4 rounded-full bg-ink text-white font-semibold text-sm tracking-tight hover:bg-trail transition disabled:opacity-50"
      >
        {loading ? 'Verificando…' : 'Confirmar'}
      </button>

      <button
        type="button"
        onClick={onResend}
        disabled={resending}
        className="text-[13px] text-muted hover:text-trail transition disabled:opacity-50 mt-1"
      >
        {resending ? 'Enviando…' : 'Reenviar código'}
      </button>

      {error && (
        <p className="text-alert text-xs text-center" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="text-trail text-xs text-center" role="status">
          {info}
        </p>
      )}
    </form>
  )
}
