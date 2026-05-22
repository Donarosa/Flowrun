import { createClient } from '@/lib/supabase/server'
import type {
  ExperienceLevel,
  GoalType,
  TipCategory,
  TipGoalContext,
  TipLevel,
} from '@/types/database'

export type EducationTip = {
  id: string
  category: TipCategory
  contentEs: string
}

const CATEGORY_LABEL: Record<TipCategory, string> = {
  respiracion: 'Respiración',
  esfuerzo: 'Esfuerzo',
  tecnica_trail: 'Técnica trail',
  nutricion: 'Nutrición',
  prevencion: 'Prevención',
  motivacion: 'Motivación',
}

export function tipCategoryLabel(c: TipCategory): string {
  return CATEGORY_LABEL[c]
}

// Devuelve los goal_context que matchean al user.
// calle_trail "hereda" tanto calle como trail porque es la transición.
function goalContextsFor(goal: GoalType): TipGoalContext[] {
  if (goal === 'calle') return ['calle', 'all']
  if (goal === 'trail') return ['trail', 'all']
  return ['calle', 'trail', 'calle_trail', 'all']
}

type TipRow = {
  id: string
  category: TipCategory
  content_es: string
  show_max_times: number
}

// Selecciona y persiste un tip para esta user_session. Idempotente:
//   - Si ya hay row en user_session_tips → retorna ese tip.
//   - Si no → matchea por blocks × level × goal × show_max_times (cap por user),
//     elige uno determinístico (hash de userSessionId), persiste y retorna.
// Cuando el user ya consumió todos sus tips disponibles N veces, retorna null
// y la UI no muestra la card.
export async function getTipForSession(input: {
  userId: string
  userSessionId: string
  blockCodes: string[]
  level: ExperienceLevel
  goal: GoalType
}): Promise<EducationTip | null> {
  const supabase = await createClient()

  // 1) Idempotencia: ¿ya elegimos un tip para esta sesión?
  type PersistedRow = {
    tip: TipRow | TipRow[] | null
  }
  const { data: existing } = await supabase
    .from('user_session_tips')
    .select(
      'tip:education_tips ( id, category, content_es, show_max_times )'
    )
    .eq('user_session_id', input.userSessionId)
    .maybeSingle<PersistedRow>()
  if (existing) {
    const tip = Array.isArray(existing.tip) ? existing.tip[0] : existing.tip
    if (tip) {
      return {
        id: tip.id,
        category: tip.category,
        contentEs: tip.content_es,
      }
    }
  }

  // 2) Match: tips compatibles con la sesión + perfil.
  const blocksWithAny = [...input.blockCodes, 'ANY']
  const goalContexts = goalContextsFor(input.goal)
  const levels: TipLevel[] = [input.level, 'all']

  const { data: candidates } = await supabase
    .from('education_tips')
    .select('id, category, content_es, show_max_times')
    .overlaps('applicable_blocks', blocksWithAny)
    .in('level', levels)
    .in('goal_context', goalContexts)
    .returns<TipRow[]>()

  if (!candidates || candidates.length === 0) return null

  // 3) Filtrar tips que ya excedieron show_max_times para este user.
  const ids = candidates.map((t) => t.id)
  const { data: shownRows } = await supabase
    .from('user_session_tips')
    .select('tip_id')
    .eq('user_id', input.userId)
    .in('tip_id', ids)
    .returns<{ tip_id: string }[]>()

  const counts = new Map<string, number>()
  for (const r of shownRows ?? []) {
    counts.set(r.tip_id, (counts.get(r.tip_id) ?? 0) + 1)
  }
  const available = candidates.filter(
    (t) => (counts.get(t.id) ?? 0) < t.show_max_times
  )
  if (available.length === 0) return null

  // 4) Elegir uno determinístico por hash de userSessionId.
  const seed = Array.from(input.userSessionId).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    7
  )
  const picked = available[seed % available.length]

  // 5) Persistir. Si dos requests concurrentes intentan insertar la misma
  // user_session_tip (clave única en user_session_id), una pierde — eso es
  // OK, el getTipForSession siguiente lee el ganador.
  await supabase.from('user_session_tips').insert({
    user_session_id: input.userSessionId,
    user_id: input.userId,
    tip_id: picked.id,
  })

  return {
    id: picked.id,
    category: picked.category,
    contentEs: picked.content_es,
  }
}
