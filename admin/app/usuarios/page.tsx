import { getUsers, type UserRow } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`
}

// Devuelve "Hoy", "Ayer", "Hace Xd" o la fecha. Para mostrar timestamps de
// actividad reciente de forma legible.
function fmtRelative(iso: string | null): { label: string; muted: boolean } {
  if (!iso) return { label: '—', muted: true }
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays < 0) return { label: fmtDate(iso), muted: false }
  if (diffDays === 0) return { label: 'Hoy', muted: false }
  if (diffDays === 1) return { label: 'Ayer', muted: false }
  if (diffDays < 7) return { label: `Hace ${diffDays}d`, muted: false }
  if (diffDays < 30) return { label: `Hace ${Math.floor(diffDays / 7)}sem`, muted: true }
  return { label: fmtDate(iso), muted: true }
}

function fmtMoney(amount: number | null, currency: string | null): string {
  if (amount == null || !currency) return '—'
  return currency === 'ARS'
    ? `$${amount.toLocaleString('es-AR')} ARS`
    : `$${amount} ${currency}`
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  trialing: { text: 'Trial', color: 'text-[var(--color-warn)]' },
  active: { text: 'Pagó', color: 'text-[var(--color-trail)]' },
  canceled: { text: 'Cancelado', color: 'text-[var(--color-muted)]' },
  expired: { text: 'Vencido', color: 'text-[var(--color-alert)]' },
}

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Mensual',
  pack_3m: 'Pack 3m',
}

export default async function UsuariosPage() {
  const users = await getUsers()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] mb-1">
            Usuarios
          </h1>
          <p className="text-[13px] text-[var(--color-muted)]">
            {users.length} usuarios registrados
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-surface-2)]">
              <tr className="text-left">
                <Th>Email</Th>
                <Th>Signup</Th>
                <Th>Trial</Th>
                <Th>Status</Th>
                <Th>Plan</Th>
                <Th>Monto</Th>
                <Th>Pago</Th>
                <Th>Tiempo sub</Th>
                <Th>Period end</Th>
                <Th>Último login</Th>
                <Th>Última sesión</Th>
                <Th>Último check-in</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRowView key={u.id} u={u} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-10 text-center text-[var(--color-muted)]"
                  >
                    Sin usuarios todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function UserRowView({ u }: { u: UserRow }) {
  const status = u.status ? STATUS_LABEL[u.status] : null

  return (
    <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/40 transition">
      <Td>
        <span className="text-[var(--color-ink)]">{u.email}</span>
        {u.name && (
          <span className="ml-2 text-[var(--color-muted)] text-[12px]">
            · {u.name}
          </span>
        )}
        {u.country && (
          <span className="ml-2 font-mono text-[10px] text-[var(--color-soft)]">
            {u.country}
          </span>
        )}
      </Td>
      <Td muted>{fmtDate(u.signedUpOn)}</Td>
      <Td>
        {u.trialDay != null ? (
          <span className="font-mono tabular-nums">
            Día <span className="text-[var(--color-ink)]">{u.trialDay}</span>
            <span className="text-[var(--color-soft)]">/7</span>
          </span>
        ) : (
          <span className="text-[var(--color-soft)]">—</span>
        )}
      </Td>
      <Td>
        {status ? (
          <span className={`font-medium ${status.color}`}>{status.text}</span>
        ) : (
          <span className="text-[var(--color-soft)]">—</span>
        )}
      </Td>
      <Td>{u.plan ? PLAN_LABEL[u.plan] ?? u.plan : <Dash />}</Td>
      <Td>{fmtMoney(u.amount, u.currency)}</Td>
      <Td>{u.paymentMethod === 'card' ? 'Tarjeta' : u.paymentMethod === 'transfer' ? 'Transfer.' : <Dash />}</Td>
      <Td>
        {u.daysOnSub != null ? (
          <span className="font-mono tabular-nums text-[var(--color-ink)]">
            {u.daysOnSub}d
          </span>
        ) : (
          <Dash />
        )}
      </Td>
      <Td muted>{u.periodEnd ? fmtDate(u.periodEnd) : <Dash />}</Td>
      <RelativeCell iso={u.lastSignInAt} />
      <RelativeCell iso={u.lastSessionAt} />
      <RelativeCell iso={u.lastCheckinAt} />
    </tr>
  )
}

function RelativeCell({ iso }: { iso: string | null }) {
  const { label, muted } = fmtRelative(iso)
  return (
    <td
      className={`px-4 py-2.5 align-baseline font-mono text-[12px] tabular-nums ${
        muted ? 'text-[var(--color-soft)]' : 'text-[var(--color-fg)]'
      }`}
      title={iso ?? undefined}
    >
      {label}
    </td>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] font-semibold px-4 py-3">
      {children}
    </th>
  )
}

function Td({
  children,
  muted,
}: {
  children: React.ReactNode
  muted?: boolean
}) {
  return (
    <td
      className={`px-4 py-2.5 align-baseline ${muted ? 'text-[var(--color-muted)]' : ''}`}
    >
      {children}
    </td>
  )
}

function Dash() {
  return <span className="text-[var(--color-soft)]">—</span>
}
