import './globals.css'
import Link from 'next/link'
import { Nav } from './nav'

export const metadata = {
  title: 'FlowRun · Admin',
  description: 'Product analytics interno',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-8">
            <Link
              href="/"
              className="font-semibold text-[15px] tracking-[-0.02em] text-[var(--color-ink)]"
            >
              flow<span className="text-[var(--color-trail)]">run</span>{' '}
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] ml-1">
                admin
              </span>
            </Link>
            <Nav />
            <form action="/login/logout" method="post" className="ml-auto">
              <button
                type="submit"
                className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
              >
                Salir
              </button>
            </form>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
