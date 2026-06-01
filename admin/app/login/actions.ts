'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE = 'flowrun_admin_session'
const ONE_WEEK = 60 * 60 * 24 * 7

function isSafeNext(next: string): boolean {
  return next.startsWith('/') && !next.startsWith('//')
}

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const nextRaw = String(formData.get('next') ?? '/')
  const next = isSafeNext(nextRaw) ? nextRaw : '/'

  const expected = process.env.ADMIN_PASSWORD
  if (!expected || password !== expected) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`)
  }

  const jar = await cookies()
  jar.set(SESSION_COOKIE, expected, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK,
  })

  redirect(next)
}

export async function logout() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  redirect('/login')
}
