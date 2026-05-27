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
    <section className="bg-paper-2 border border-border rounded-[18px] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] text-center">
      <div className="w-[42px] h-[42px] rounded-[12px] bg-terracotta-tint border border-terracotta-deep/30 flex items-center justify-center mx-auto mb-4">
        <span aria-hidden className="text-lg">🔒</span>
      </div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-terracotta-deep font-bold mb-2">
        Acceso bloqueado
      </p>
      <h2 className="text-[18px] font-semibold tracking-[-0.022em] text-ink mb-1.5 text-balance">
        {title}
      </h2>
      <p className="text-[12.5px] text-muted leading-[1.5] mb-5">{body}</p>
      <Link
        href="/suscripcion"
        className="inline-flex items-center justify-center gap-2.5 text-white font-semibold text-[14px] tracking-[-0.005em] rounded-[13px] px-5 min-h-[46px] bg-gradient-to-b from-trail to-trail-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(20,30,20,0.1),0_6px_14px_-6px_rgba(61,107,63,0.5)] hover:brightness-[1.03] transition"
      >
        <span>{cta}</span>
        <span
          aria-hidden
          className="font-mono w-7 h-7 rounded-[9px] bg-white/15 flex items-center justify-center text-[13px] font-medium"
        >
          →
        </span>
      </Link>
    </section>
  )
}
