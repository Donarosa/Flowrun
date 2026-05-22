import { selectProPlanForm } from './actions'
import type { ProPlanSummary } from '@/lib/plan'

type Props = {
  plans: ProPlanSummary[]
}

export function ProPlansSection({ plans }: Props) {
  if (plans.length === 0) return null
  return (
    <section className="mt-10">
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-pine font-bold mb-2">
        Planes pro · Sarah McCormack
      </p>
      <p className="text-[12.5px] text-muted mb-5 leading-relaxed">
        Planes específicos por distancia, diseñados por Sarah McCormack (Inov-8).
        Requieren base sólida y disponibilidad de 5-6 días semanales.
      </p>
      <ul className="flex flex-col gap-3">
        {plans.map((p) => (
          <li key={p.code}>
            <ProPlanCard plan={p} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProPlanCard({ plan }: { plan: ProPlanSummary }) {
  return (
    <article className="bg-paper-2 rounded-2xl p-4 shadow-[inset_0_0_0_1px_var(--color-border)]">
      <div className="flex items-baseline gap-2 mb-1.5">
        <h3 className="text-[15px] font-extrabold tracking-tight text-ink flex-1">
          {plan.name}
        </h3>
        <span className="font-mono text-[10px] tracking-[0.04em] text-trail font-semibold tabular-nums shrink-0">
          {plan.totalWeeks} sem · {plan.weeklyDays}d
        </span>
      </div>
      {plan.description && (
        <p className="text-[12.5px] text-muted leading-snug mb-3">
          {plan.description}
        </p>
      )}
      <form action={selectProPlanForm}>
        <input type="hidden" name="code" value={plan.code} />
        <button
          type="submit"
          className="w-full bg-pine text-paper rounded-xl py-2 text-[13px] font-semibold hover:bg-pine-deep transition"
        >
          Elegir este plan
        </button>
      </form>
    </article>
  )
}
