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

// Selecciona un tip al azar matcheado por:
//   - applicable_blocks overlapea con los códigos de la sesión, o contiene 'ANY'
//   - level coincide con el del usuario, o es 'all'
//   - goal_context coincide con el goal del usuario (con herencia de calle_trail), o es 'all'
// Determinístico-por-sesión: usamos el userSessionId como semilla del orden,
// para que el mismo tip aparezca en lecturas repetidas de la misma sesión.
export async function getTipForSession(input: {
  userSessionId: string
  blockCodes: string[]
  level: ExperienceLevel
  goal: GoalType
}): Promise<EducationTip | null> {
  const supabase = await createClient()

  const blocksWithAny = [...input.blockCodes, 'ANY']
  const goalContexts = goalContextsFor(input.goal)

  const levels: TipLevel[] = [input.level, 'all']
  const { data: tips } = await supabase
    .from('education_tips')
    .select('id, category, content_es')
    .overlaps('applicable_blocks', blocksWithAny)
    .in('level', levels)
    .in('goal_context', goalContexts)
    .returns<{ id: string; category: TipCategory; content_es: string }[]>()

  if (!tips || tips.length === 0) return null

  // Hash simple del userSessionId para elegir un tip estable por sesión.
  const seed = Array.from(input.userSessionId).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    7
  )
  const picked = tips[seed % tips.length]

  return {
    id: picked.id,
    category: picked.category,
    contentEs: picked.content_es,
  }
}
