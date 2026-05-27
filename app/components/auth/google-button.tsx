'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function GoogleButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-[11px] px-[18px] py-[14px] rounded-[14px] bg-paper-2 text-ink font-semibold text-[14.5px] tracking-[-0.012em] border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(20,30,20,0.06),0_4px_14px_-10px_rgba(20,30,20,0.18)] hover:bg-cream transition disabled:opacity-50"
      >
        <GoogleIcon />
        <span>{loading ? 'Conectando…' : 'Continuar con Google'}</span>
      </button>
      {error && (
        <p className="text-alert text-xs mt-2 text-center" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.997 10.997 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1-.34-2.09c0-.73.13-1.43.34-2.09V7.07H2.18A11.01 11.01 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}
