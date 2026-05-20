'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function EmailForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/login/verify?email=${encodeURIComponent(email)}`)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted font-semibold">
        Tu email
      </label>
      <input
        type="email"
        required
        autoFocus
        autoComplete="email"
        inputMode="email"
        placeholder="vos@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className="w-full px-4 py-3.5 rounded-2xl bg-paper-2 text-ink text-base shadow-[inset_0_0_0_1px_var(--color-border)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-trail)] disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={loading || !email}
        className="mt-2 flex items-center justify-center py-3.5 px-4 rounded-full bg-ink text-white font-semibold text-sm tracking-tight hover:bg-trail transition disabled:opacity-50"
      >
        {loading ? 'Enviando código…' : 'Enviame el código'}
      </button>

      {error && (
        <p className="text-alert text-xs text-center" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
