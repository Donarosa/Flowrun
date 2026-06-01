import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'flowrun_admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Login + assets siempre accesibles
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return new NextResponse('ADMIN_PASSWORD not configured', { status: 500 })
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value
  if (cookie !== expected) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
