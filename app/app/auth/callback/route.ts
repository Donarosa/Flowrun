import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'

// Handles two flows:
// 1. OAuth (Google) → ?code=...
// 2. Email magic link / OTP → ?token_hash=...&type=...
//
// IMPORTANTE: las cookies de sesión deben setearse directamente en la
// response que devolvemos (NextResponse.redirect). Si usamos `cookies()`
// de next/headers + redirect, las cookies se pierden en el redirect y el
// usuario vuelve al login en el primer intento.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Determinar la URL absoluta del redirect respetando proxies de Vercel.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocal = process.env.NODE_ENV === 'development'
  const targetOrigin = isLocal
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin

  // Crear la response de redirect AHORA para poder adjuntarle las cookies
  // que va a setear Supabase al intercambiar el code.
  let response = NextResponse.redirect(`${targetOrigin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')
            ? parseCookieHeader(request.headers.get('cookie')!)
            : []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) return response
  }

  // Falló auth: redirect al login con flag de error.
  return NextResponse.redirect(`${targetOrigin}/login?error=auth`)
}

function parseCookieHeader(header: string): { name: string; value: string }[] {
  return header.split(';').map((c) => {
    const idx = c.indexOf('=')
    const name = c.slice(0, idx).trim()
    const value = c.slice(idx + 1).trim()
    return { name, value }
  })
}
