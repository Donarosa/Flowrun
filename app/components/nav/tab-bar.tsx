'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = {
  href: string
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  {
    href: '/dashboard',
    label: 'Hoy',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[22px] h-[22px]"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    href: '/plan',
    label: 'Plan',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[22px] h-[22px]"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[22px] h-[22px]"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/'
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function TabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-paper-2 border-t border-hair"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      <ul className="grid grid-cols-3 max-w-md mx-auto px-6 pt-3.5 gap-1.5">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href)
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`relative flex flex-col items-center gap-[3px] py-1 ${
                  active ? 'text-trail' : 'text-muted hover:text-ink'
                } transition`}
              >
                {tab.icon}
                <span
                  className={`text-[11px] tracking-[-0.005em] ${
                    active ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {tab.label}
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-trail"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
