import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SESSION_COOKIE = 'flowrun_admin_session'

export async function POST(req: Request) {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  const url = new URL('/login', req.url)
  return NextResponse.redirect(url, { status: 303 })
}
