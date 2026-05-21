import Link from 'next/link'

type Props = {
  title?: string
  body?: string
  cta?: string
}

export function PaywallBlock({
  title = 'Tu acceso terminó',
  body = 'Para seguir entrenando con tu plan, suscribite. Cancelás cuando querés.',
  cta = 'Ver planes',
}: Props) {
  return (
    <section className="bg-paper-2 rounded-3xl p-6 shadow-[inset_0_0_0_1px_var(--color-border)] text-center">
      <div className="w-12 h-12 rounded-2xl bg-terracotta-tint flex items-center justify-center mx-auto mb-4">
        <span className="text-xl">🔒</span>
      </div>
      <h2 className="text-lg font-extrabold tracking-tight text-ink mb-2">
        {title}
      </h2>
      <p className="text-[13px] text-muted leading-relaxed mb-5">{body}</p>
      <Link
        href="/suscripcion"
        className="inline-flex items-center justify-center py-3 px-6 rounded-full bg-trail text-white font-semibold text-[14px] tracking-tight hover:bg-trail-deep transition"
      >
        {cta} →
      </Link>
    </section>
  )
}
