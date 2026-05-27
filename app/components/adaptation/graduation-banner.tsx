import { acceptGraduation } from '@/app/(app)/dashboard/actions'
import type { GraduationOffer } from '@/lib/gate'

const TARGET_LABEL: Record<string, string> = {
  nuevo_calle_3d: 'Base aeróbica · calle · 3 días',
  calle_trail_base_3d: 'Calle a Trail · base · 3 días',
  nuevo_montana_3d: 'Trail sostenible · 3 días',
  calle_trail_avanzado_4d: 'Trail avanzado · 4 días',
}

type Props = {
  offer: GraduationOffer
}

export function GraduationBanner({ offer }: Props) {
  const targetLabel = TARGET_LABEL[offer.targetTemplateCode] ?? 'Próximo plan'
  return (
    <article className="rounded-[14px] border border-lichen-deep bg-lichen p-4 mb-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
      <div className="flex items-center gap-2 mb-1.5">
        <span aria-hidden className="text-base">🌿</span>
        <p className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-pine font-bold">
          Te graduás
        </p>
      </div>
      <p className="text-[13.5px] text-ink leading-snug mb-2.5">
        {offer.message_es}
      </p>
      <div className="text-[12px] text-muted mb-3">
        Próximo plan: <span className="text-ink font-semibold">{targetLabel}</span>
      </div>
      <form action={acceptGraduation}>
        <button
          type="submit"
          className="w-full flex items-center justify-between text-white font-semibold text-[14px] tracking-[-0.005em] rounded-[13px] pl-5 pr-4 min-h-[46px] bg-gradient-to-b from-trail to-trail-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(20,30,20,0.1),0_6px_14px_-6px_rgba(61,107,63,0.5)] hover:brightness-[1.03] transition"
        >
          <span>Pasar a mi próximo plan</span>
          <span
            aria-hidden
            className="font-mono w-7 h-7 rounded-[9px] bg-white/15 flex items-center justify-center text-[13px] font-medium"
          >
            →
          </span>
        </button>
      </form>
    </article>
  )
}
