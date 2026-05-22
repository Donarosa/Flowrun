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
    <article
      className="rounded-2xl p-5 mb-5 shadow-[inset_0_0_0_1px_rgba(74,93,58,0.18)]"
      style={{ backgroundColor: 'var(--color-lichen)' }}
    >
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-pine font-bold mb-1.5">
        Te graduás
      </p>
      <p className="text-[13.5px] text-ink leading-snug mb-3">
        {offer.message_es}
      </p>
      <div className="text-[12px] text-muted mb-4">
        Próximo plan: <span className="text-ink font-semibold">{targetLabel}</span>
      </div>
      <form action={acceptGraduation}>
        <button
          type="submit"
          className="w-full bg-pine text-paper rounded-xl py-2.5 text-[13.5px] font-semibold hover:bg-pine-deep transition"
        >
          Pasar a mi próximo plan
        </button>
      </form>
    </article>
  )
}
