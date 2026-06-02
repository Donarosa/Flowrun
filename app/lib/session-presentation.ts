// Helpers para mostrar la sesión en formato "stepper + por qué + nota".
// Toda la lógica de presentación vive acá; la página solo arma JSX.

import type { SessionDetail } from './plan'

export type EffortLevel = 'soft' | 'moderate' | 'hard'

export type StepKind = 'warm' | 'work' | 'cool'

export type SessionStep = {
  kind: StepKind
  name: string
  duration: string
  description: string
  effort: { level: EffortLevel; label: string }
  /** Si el bloque trae intervalos detectados (ej "5 x 1 min duro"), se desglosan acá. */
  repeats?: SessionRepeat | null
}

export type SessionRepeat = {
  reps: number
  go: { main: string; sub: string }
  rec: { main: string; sub: string }
}

const SOFT_BLOCKS = new Set([
  'RA', 'RS', 'MF', 'CF', 'SC', 'TL', 'TLM', 'RW', 'SU',
])
const HARD_BLOCKS = new Set(['IU', 'SF', 'PL', 'FE', 'TE', 'FK', 'HF'])

export function effortFor(code: string): SessionStep['effort'] {
  if (HARD_BLOCKS.has(code)) return { level: 'hard', label: 'Fuerte' }
  if (SOFT_BLOCKS.has(code)) return { level: 'soft', label: 'Suave' }
  return { level: 'moderate', label: 'Moderado' }
}

// "Por qué" por código de bloque — texto motivacional / contextual.
const BLOCK_WHY: Record<string, { title: string; body: string }> = {
  RW: { title: 'Por qué run-walk', body: 'Alternar trote y caminata construye base aeróbica sin romper. Es la forma más segura de empezar a correr.' },
  RS: { title: 'Por qué rodaje sostenible', body: 'El trote conversacional es la base de todo. Construye motor aeróbico y resistencia sin acumular fatiga.' },
  RP: { title: 'Por qué rodaje progresivo', body: 'Terminar firme te enseña a sostener ritmo cuando ya estás cansado — la habilidad clave de las carreras.' },
  IU: { title: 'Por qué intervalos al umbral', body: 'Empujar el techo de lo cómodo y sostenerlo mueve todos los ritmos para arriba.' },
  ST: { title: 'Por qué strides', body: 'Pasadas cortas a alta velocidad mejoran economía y técnica sin sumar fatiga.' },
  TL: { title: 'Por qué tirada larga', body: 'La resistencia se construye con tiempo en pie. Más larga, más fuerte el motor aeróbico.' },
  RA: { title: 'Por qué recuperación activa', body: 'El movimiento suave después de un esfuerzo grande acelera la regeneración más que quedarse quieto.' },
  SC: { title: 'Por qué subidas conversacionales', body: 'Fuerza y potencia con menos impacto que el llano. La cuesta hace de gimnasio.' },
  SF: { title: 'Por qué cuestas fuertes', body: 'Construyen fuerza y potencia con bajo impacto. Subí fuerte, recuperá bien — esa es la fórmula.' },
  TB: { title: 'Por qué técnica de bajada', body: 'Bajar es el otro 50% del trail. Sin práctica, las bajadas destrozan piernas y tiempos.' },
  SMC: { title: 'Por qué simulación trail en ciudad', body: 'Escaleras, cambios de ritmo, terreno mixto — sin salir del barrio. Aproximación al trail.' },
  TLM: { title: 'Por qué tirada larga en montaña', body: 'Resistencia específica para trail. Tiempo en terreno mixto que el llano nunca replica.' },
  CF: { title: 'Por qué caminata fuerte', body: 'En cuestas largas la caminata es estrategia, no debilidad. Te ahorra para terminar.' },
  FG: { title: 'Por qué fuerza general', body: 'Más fuerza = menos lesiones y mejor economía. El runner que entrena fuerza dura más.' },
  FE: { title: 'Por qué fuerza excéntrica', body: 'Bajadas controladas. Lo que prepara las piernas para descender sin destruirse.' },
  PL: { title: 'Por qué pliometría suave', body: 'Los saltos enseñan al sistema elástico a devolver energía. Más eficiencia con el mismo esfuerzo.' },
  MF: { title: 'Por qué movilidad', body: 'El rango de movimiento es libertad para correr bien. Sin esto, todo lo demás cuesta más.' },
  SU: { title: 'Por qué surges', body: 'Aceleraciones cortas dentro de un rodaje easy despiertan velocidad y técnica sin sumar la fatiga de un workout duro.' },
  FK: { title: 'Por qué fartlek', body: 'Alternar ritmos te enseña a cambiar de marcha — clave en carreras de trail con terreno variado.' },
  TE: { title: 'Por qué tempo', body: 'Ritmo sostenido en umbral entrena al cuerpo a tolerar el lactato. Aguantás más tiempo en firme antes de romperte.' },
  PR: { title: 'Por qué progresivo', body: 'Subir intensidad por bloques te entrena a meter cambio cuando ya estás cansado — la habilidad clave de las carreras largas.' },
  HF: { title: 'Por qué hill fartlek', body: 'El terreno hace de cronómetro. Subís duro, recuperás en llanos. Entrenás cardio y técnica al mismo tiempo.' },
}

export function whyFor(blocks: { code: string }[]): { title: string; body: string } {
  if (!blocks.length) return { title: 'Por qué esta sesión', body: 'Una sesión más en tu camino.' }
  return BLOCK_WHY[blocks[0].code] ?? { title: 'Por qué esta sesión', body: 'Una sesión más en tu camino.' }
}

// Tips genéricos por categoría (cuando no hay nota explícita en el bloque).
const GENERIC_TIPS: Record<string, string> = {
  carrera: 'Quedate del lado del ritmo donde podés hablar. Si te falta el aire, bajá una marcha.',
  trail: 'En subida acortá el paso y mirá 3-4 metros adelante. En bajada relajá los hombros.',
  fuerza: 'Calidad > cantidad. Si la técnica se rompe, parás. Mejor 8 reps perfectas que 12 mediocres.',
  movilidad: 'Sin rebotes. Buscá la sensación de estiramiento, no el dolor.',
}

// Categoría primaria (por código del primer bloque). Hardcodeado porque no
// tenemos la category cargada al frontend; se infiere por código.
const CARRERA_CODES = new Set(['RW','RS','RP','IU','ST','TL','RA','SU','FK','TE','PR'])
const TRAIL_CODES = new Set(['SC','SF','TB','SMC','TLM','CF','HF'])
const FUERZA_CODES = new Set(['FG','FE','PL'])
const MOVILIDAD_CODES = new Set(['MF'])

export function primaryCategory(blocks: { code: string }[]): string {
  if (!blocks.length) return '?'
  const c = blocks[0].code
  if (CARRERA_CODES.has(c)) return 'carrera'
  if (TRAIL_CODES.has(c)) return 'trail'
  if (FUERZA_CODES.has(c)) return 'fuerza'
  if (MOVILIDAD_CODES.has(c)) return 'movilidad'
  return '?'
}

export function categoryLabel(cat: string): string {
  return cat === 'carrera' ? 'Carrera'
    : cat === 'trail' ? 'Trail'
    : cat === 'fuerza' ? 'Fuerza'
    : cat === 'movilidad' ? 'Movilidad'
    : '—'
}

export function noteFor(blocks: { code: string; note?: string }[]): string {
  for (const b of blocks) {
    if (b.note?.trim()) return b.note.trim()
  }
  const cat = primaryCategory(blocks)
  return GENERIC_TIPS[cat] ?? 'Confiá en el proceso. Cada sesión cuenta.'
}

// Detección de intervalos en notas tipo "5 x 1 min duro".
const INTERVAL_PAT = /(\d+)\s*[x×]\s*(\d+)\s*(s|min|seg)/gi
type ParsedInterval = { reps: number; dur: number; unitLabel: string }

function parseIntervals(note: string | undefined): ParsedInterval[] {
  if (!note) return []
  const items: ParsedInterval[] = []
  let m: RegExpExecArray | null
  INTERVAL_PAT.lastIndex = 0
  while ((m = INTERVAL_PAT.exec(note)) !== null) {
    const reps = parseInt(m[1], 10)
    const dur = parseInt(m[2], 10)
    const unit = m[3].toLowerCase()
    items.push({
      reps,
      dur,
      unitLabel: unit.startsWith('s') ? `${dur} s` : `${dur} min`,
    })
  }
  return items
}

const INTERVAL_BLOCKS = new Set(['IU', 'SF', 'SC', 'ST', 'TB'])

function repeatForBlock(code: string, iv: ParsedInterval): SessionRepeat {
  let recMain = 'Recuperación suave'
  let recSub = 'Tomate el tiempo que necesites'
  if (code === 'SF' || code === 'SC') {
    recMain = 'Trote de vuelta al inicio'
    recSub = 'Recuperación · bajá suave'
  } else if (code === 'IU') {
    recMain = 'Trote muy suave de recuperación'
    recSub = 'Hasta sentirte listo para la próxima'
  } else if (code === 'ST') {
    recMain = 'Caminata de recuperación'
    recSub = 'Recuperación completa'
  }
  return {
    reps: iv.reps,
    go: { main: `${iv.unitLabel} de trabajo`, sub: 'Ritmo exigente' },
    rec: { main: recMain, sub: recSub },
  }
}

/**
 * Arma el stepper completo de la sesión: entrada en calor (amarilla),
 * bloques de trabajo (verde, con repeat si hay intervalos), vuelta a la calma.
 */
export function buildSteps(session: SessionDetail): SessionStep[] {
  const total = session.totalDurationMin
  const cats = new Set(session.blocks.map((b) => primaryCategory([b])))
  const isPureStrength = [...cats].every((c) => c === 'fuerza' || c === 'movilidad')

  const steps: SessionStep[] = []

  // Warmup
  if (!isPureStrength && total >= 15) {
    const warmMin = total < 35 ? 5 : 10
    steps.push({
      kind: 'warm',
      name: 'Entrada en calor',
      duration: `~${warmMin} min`,
      description: 'Trote suave o caminata para activar. Sumá movilidad si lo necesitás.',
      effort: { level: 'soft', label: 'Muy suave' },
    })
  } else if (isPureStrength) {
    steps.push({
      kind: 'warm',
      name: 'Activación',
      duration: '~3 min',
      description: 'Movilidad de tobillo, cadera y hombros. Movimientos lentos y controlados.',
      effort: { level: 'soft', label: 'Muy suave' },
    })
  }

  // Blocks
  for (const b of session.blocks) {
    const code = b.code
    const note = b.note?.trim() ?? ''
    const desc = b.description ?? note ?? ''
    const effort = effortFor(code)
    const intervals = parseIntervals(note)

    if (intervals.length && INTERVAL_BLOCKS.has(code)) {
      for (let j = 0; j < intervals.length; j++) {
        const iv = intervals[j]
        const name = intervals.length > 1 ? `${b.name} · serie ${j + 1}` : b.name
        steps.push({
          kind: 'work',
          name,
          duration: `${iv.reps} reps`,
          description: j === 0 ? desc : 'Misma estructura, distintas duraciones.',
          effort,
          repeats: repeatForBlock(code, iv),
        })
      }
    } else {
      steps.push({
        kind: 'work',
        name: b.name,
        duration: `${b.durationMin} min`,
        description: desc,
        effort,
      })
    }
  }

  // Cooldown
  if (!isPureStrength && total >= 15) {
    steps.push({
      kind: 'cool',
      name: 'Vuelta a la calma',
      duration: '~5 min',
      description: 'Trote suave + estiramientos livianos para cerrar.',
      effort: { level: 'soft', label: 'Suave' },
    })
  } else if (isPureStrength) {
    steps.push({
      kind: 'cool',
      name: 'Cierre',
      duration: '~3 min',
      description: 'Movilidad final, respiración profunda. Cerrá tranquilo.',
      effort: { level: 'soft', label: 'Muy suave' },
    })
  }

  return steps
}

// Override de títulos por si la migración 0016 no se aplicó todavía.
const TITLE_OVERRIDES: Record<string, string> = {
  Progresivo: 'Rodaje Progresivo Pro',
  Tempo: 'Tempo Run',
}

export function displayTitle(sessionName: string): string {
  return TITLE_OVERRIDES[sessionName] ?? sessionName
}

export function blockTagLabel(blocks: { code: string; name: string }[]): string {
  return blocks.map((b) => b.name).join(' + ')
}
