'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/flujos', label: 'Flujos' },
  { href: '/usuarios', label: 'Usuarios' },
]

export function Nav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1">
      {ITEMS.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition ${
              active
                ? 'bg-[var(--color-surface-2)] text-[var(--color-ink)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
