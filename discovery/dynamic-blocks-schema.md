# Sistema de Bloques Dinámicos — Schema Completo

Fecha: 2026-03-18 (v2 — ajustes run-walk, criterio de paso, Z1/Z2)

Aplica a: **Desde Cero**, **Nuevo (calle/montaña)** y **Calle → Montaña**
NO aplica a: Pro (planes estáticos pre-armados)

### Fuentes científicas de los ajustes v2

1. **Run-walk progresivo**: Galloway (2016) *The Run-Walk-Run Method*; Fokkema et al. (2019) *J Sci Med Sport* 22(1):106-111 — progresión demasiado rápida = causa principal de abandono en novatos.
2. **Criterio de paso por respuesta**: Gabbett (2016) *BJSM* 50(5):273-280 (ACWR); Bourdon et al. (2017) *IJSPP* 12(S2):S2-161 (consenso monitoreo); Foster et al. (2001) *JSCR* 15(1):109-115 (session-RPE).
3. **Separar Z1 de Z2**: Seiler & Kjerland (2006) *Scand J Med Sci Sports* 16(1):49-56 (modelo polarizado); Esteve-Lanao et al. (2007) *Int J Sports Med* 28(3):226-232 (más Z1 = mejores resultados); Scheer et al. (2020) *Int J Sports Med* 41(12):829-835 (distribución intensidad trail).

---

## 1. CATÁLOGO DE BLOQUES (los LEGOs)

### `workout_blocks` — Cada tipo de ejercicio que existe

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| id | UUID | PK | |
| code | VARCHAR(6) | Código corto único | `RS`, `SC`, `FE` |
| name | VARCHAR | Nombre visible al usuario | "Rodaje Sostenible" |
| category | ENUM | `carrera`, `trail`, `fuerza`, `movilidad` | `carrera` |
| subcategory | VARCHAR | Agrupación fina | "base_aerobica" |
| description | TEXT | Qué es y para qué sirve (educativo) | "Correr a ritmo conversacional..." |
| intensity_zone | ENUM | `z1`, `z2`, `z3`, `z4`, `mixed` | `z2` |
| base_duration_min | INT | Duración base sin modificar | 40 |
| min_duration_min | INT | Mínimo permitido por adaptación | 15 |
| max_duration_min | INT | Máximo permitido por adaptación | 90 |
| requires_hr | BOOL | Necesita reloj con FC? | false |
| trail_specific | BOOL | Es específico de trail? | false |
| requires_equipment | VARCHAR | Equipamiento necesario (nullable) | "escaleras" |
| min_level | ENUM | `nuevo`, `base`, `avanzado` | `nuevo` |
| warmup_default_min | INT | Calentamiento sugerido | 5 |
| cooldown_default_min | INT | Vuelta a calma sugerida | 5 |
| effort_metric | ENUM | `talk_test`, `rpe`, `hr`, `pace` | `talk_test` |
| is_active | BOOL | Habilitado en el sistema | true |

### Datos iniciales de `workout_blocks`:

```
CARRERA
───────
RW  | Run-Walk Progresivo    | z1-z2 | 30 min | min 20 | max 40  | cero    ← NUEVO v2
RS  | Rodaje Sostenible      | z1-z2 | 40 min | min 15 | max 90  | nuevo   ← z2 → z1-z2 (v2)
RP  | Rodaje Progresivo      | mixed | 45 min | min 25 | max 70  | base
IU  | Intervalos Umbral      | z4    | 35 min | min 25 | max 50  | avanzado
ST  | Strides/Pasadas        | z4    | 10 min | min  5 | max 15  | base
TL  | Tirada Larga           | z1-z2 | 70 min | min 45 | max 150 | base    ← z2 → z1-z2 (v2)
RA  | Recuperación Activa    | z1    | 25 min | min 15 | max 40  | nuevo

TRAIL ESPECÍFICO
────────────────
SC  | Subidas Conversacionales | z2    | 30 min | min 20 | max 50  | nuevo    | trail
SF  | Subidas Fuertes          | z4    | 30 min | min 20 | max 45  | avanzado | trail
TB  | Técnica de Bajada        | z1-z2 | 25 min | min 15 | max 40  | base     | trail  ← z2 → z1-z2 (v2)
SMC | Sesión Mixta Ciudad      | mixed | 40 min | min 25 | max 60  | nuevo    | trail
TLM | Tirada Larga Montaña     | z1-z2 | 80 min | min 50 | max 180 | base     | trail  ← z2 → z1-z2 (v2)
CF  | Caminata Fuerte          | z1    | 35 min | min 20 | max 60  | nuevo    | trail  ← z2 → z1 (v2)

FUERZA
──────
FG  | Fuerza General         | n/a   | 25 min | min 15 | max 40  | nuevo
FE  | Fuerza Excéntrica      | n/a   | 20 min | min 15 | max 35  | nuevo
PL  | Pliometría Suave       | n/a   | 15 min | min 10 | max 25  | base
MF  | Movilidad/Flexibilidad | n/a   | 15 min | min 10 | max 25  | nuevo
```

---

## 2. VARIANTES POR NIVEL

### `block_variants` — Cómo se renderiza cada bloque según nivel

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| id | UUID | PK | |
| block_id | UUID FK | Referencia a workout_blocks | → RS |
| level | ENUM | `cero`, `nuevo`, `base`, `avanzado` | `cero` |
| goal_context | ENUM | `calle`, `calle_trail`, `trail` | `calle` |
| duration_modifier | DECIMAL | Multiplicador de duración | 0.6 |
| intensity_modifier | DECIMAL | Multiplicador de intensidad | 0.8 |
| warmup_min | INT | Calentamiento para este nivel | 5 |
| cooldown_min | INT | Vuelta a calma | 5 |
| structure_json | JSONB | Estructura interna de la sesión | ver abajo |
| instructions_es | TEXT | Instrucciones en español | ver abajo |
| instructions_en | TEXT | Instrucciones en inglés (nullable) | |
| effort_description_es | TEXT | Cómo sentir el esfuerzo | "Podés hablar sin esfuerzo" |
| can_walk | BOOL | Se permite caminar? | true |
| includes_strides | BOOL | Incluye pasadas al final? | false |

### Nota v2: Zonas Z1 vs Z2

Los bloques ahora distinguen explícitamente Z1 y Z2:
- **Z1** (RPE 1-3): Podés hablar sin ningún esfuerzo. Caminar fuerte, trote muy suave. Respiración nasal posible.
- **Z2** (RPE 4-5): Podés hablar en frases completas pero notás el esfuerzo. Ritmo conversacional sostenido.
- **Z1-Z2**: La sesión combina ambas. En llano tiende a Z2, en subida se permite caer a Z1 (caminar).

Referencia: Seiler & Kjerland (2006) — atletas de resistencia mejoran más con 75-80% del volumen en Z1, no en Z2 media.

---

### Ejemplo `structure_json` para RW × Cero × Calle (NUEVO v2):

```json
{
  "phases": [
    {
      "name": "Calentamiento",
      "duration_min": 5,
      "type": "walk",
      "instruction": "Caminata fácil",
      "zone": "z1"
    },
    {
      "name": "Bloque run-walk",
      "duration_min": 20,
      "type": "run_walk",
      "instruction": "Alterná trote muy suave con caminata según el ratio de tu semana",
      "zone": "z1-z2",
      "run_walk_ratio": {
        "run_min": 1,
        "walk_min": 4,
        "progression_by_block": {
          "A": { "run_min": 1, "walk_min": 4, "note": "Semanas 1-2" },
          "B": { "run_min": 3, "walk_min": 2, "note": "Semanas 3-4" },
          "C": { "run_min": 5, "walk_min": 2, "note": "Semanas 5-6" },
          "D": { "run_min": "continuo", "walk_min": 0, "note": "Semanas 7-8" }
        }
      },
      "walk_allowed": true
    },
    {
      "name": "Vuelta a calma",
      "duration_min": 5,
      "type": "walk",
      "instruction": "Caminata suave",
      "zone": "z1"
    }
  ],
  "total_min": 30
}
```

### Ejemplo `structure_json` para RS × Nuevo × Calle:

```json
{
  "phases": [
    {
      "name": "Calentamiento",
      "duration_min": 5,
      "type": "walk",
      "instruction": "Caminata rápida"
    },
    {
      "name": "Bloque principal",
      "duration_min": 15,
      "type": "run_walk",
      "instruction": "Alterná 3 min trote + 1 min caminata",
      "intensity": "conversacional",
      "walk_allowed": true
    },
    {
      "name": "Vuelta a calma",
      "duration_min": 5,
      "type": "walk",
      "instruction": "Caminata suave"
    }
  ],
  "total_min": 25
}
```

### Ejemplo `structure_json` para RS × Base × Calle→Trail:

```json
{
  "phases": [
    {
      "name": "Calentamiento",
      "duration_min": 10,
      "type": "easy_run",
      "instruction": "Trote suave"
    },
    {
      "name": "Bloque principal",
      "duration_min": 30,
      "type": "steady_run",
      "instruction": "Ritmo conversacional sostenido. Si hay subida, bajá el ritmo pero mantené el esfuerzo.",
      "intensity": "z2",
      "walk_allowed": false
    },
    {
      "name": "Vuelta a calma",
      "duration_min": 5,
      "type": "easy_run",
      "instruction": "Trote muy suave"
    }
  ],
  "total_min": 45
}
```

### Ejemplo `structure_json` para SC × Nuevo × Trail:

```json
{
  "phases": [
    {
      "name": "Calentamiento",
      "duration_min": 10,
      "type": "easy_run",
      "instruction": "Trote suave en llano"
    },
    {
      "name": "Repeticiones subida",
      "duration_min": 15,
      "type": "hill_repeats",
      "instruction": "6 repeticiones de 40 seg subiendo caminando fuerte. Bajada caminando suave.",
      "reps": 6,
      "work_sec": 40,
      "rest": "bajada caminando",
      "intensity": "conversacional_firme",
      "walk_allowed": true
    },
    {
      "name": "Vuelta a calma",
      "duration_min": 5,
      "type": "walk",
      "instruction": "Caminata suave"
    }
  ],
  "total_min": 30
}
```

### Ejemplo `structure_json` para FE (Fuerza Excéntrica):

```json
{
  "phases": [
    {
      "name": "Activación",
      "duration_min": 5,
      "type": "mobility",
      "instruction": "Círculos de cadera, activación de glúteos"
    },
    {
      "name": "Bloque excéntrico",
      "duration_min": 15,
      "type": "strength",
      "exercises": [
        {
          "name": "Sentadilla excéntrica lenta",
          "sets": 3,
          "reps": 8,
          "tempo": "4 seg bajando, 1 seg subiendo",
          "rest_sec": 45
        },
        {
          "name": "Step down controlado",
          "sets": 3,
          "reps": 8,
          "each_side": true,
          "tempo": "3 seg bajando",
          "rest_sec": 45
        },
        {
          "name": "Peso muerto una pierna",
          "sets": 2,
          "reps": 10,
          "each_side": true,
          "rest_sec": 30
        }
      ]
    },
    {
      "name": "Estiramiento",
      "duration_min": 5,
      "type": "stretch",
      "instruction": "Cuádriceps, isquiotibiales, gemelos"
    }
  ],
  "total_min": 25
}
```

### Ejemplo `structure_json` para SMC (Sesión Mixta Ciudad):

```json
{
  "phases": [
    {
      "name": "Calentamiento",
      "duration_min": 8,
      "type": "easy_run",
      "instruction": "Trote suave"
    },
    {
      "name": "Circuito urbano",
      "duration_min": 25,
      "type": "mixed_terrain",
      "instruction": "Alterná entre trote conversacional y bloques de simulación trail",
      "segments": [
        {
          "type": "stairs_up",
          "duration": "3 tramos subiendo",
          "effort": "firme pero conversacional"
        },
        {
          "type": "easy_run",
          "duration_min": 3,
          "effort": "recuperación"
        },
        {
          "type": "stairs_down",
          "duration": "3 tramos bajando",
          "effort": "controlado, pisada suave"
        },
        {
          "type": "easy_run",
          "duration_min": 3,
          "effort": "recuperación"
        }
      ],
      "repeat": 3
    },
    {
      "name": "Vuelta a calma",
      "duration_min": 7,
      "type": "easy_run",
      "instruction": "Trote muy suave"
    }
  ],
  "total_min": 40
}
```

---

## 3. REGLAS DE PROGRESIÓN POR BLOQUE

### `block_progression_rules` — Cómo crece cada bloque semana a semana

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| id | UUID | PK | |
| block_id | UUID FK | Referencia a workout_blocks | → RS |
| level | ENUM | `cero`, `nuevo`, `base`, `avanzado` | `nuevo` |
| week_increment_min | INT | Minutos que sube por semana | 5 |
| week_increment_pct | DECIMAL | O porcentaje que sube (alternativo) | null |
| max_weeks_before_plateau | INT | Semanas creciendo antes de estabilizar | 6 |
| deload_week_interval | INT | Cada cuántas semanas descargar | 4 |
| deload_reduction_pct | DECIMAL | Cuánto bajar en descarga | 0.20 |
| intensity_unlock_week | INT | Semana donde se permite subir intensidad | 5 |
| adds_block_code | VARCHAR | Bloque que se agrega en semana X (nullable) | `ST` |
| adds_block_at_week | INT | En qué semana se agrega (nullable) | 4 |
| **gate_criteria** | **JSONB** | **Criterio de paso al siguiente bloque (v2)** | **ver abajo** |

### `gate_criteria` — Criterio de paso entre bloques (NUEVO v2)

En lugar de avanzar automáticamente por semana, el sistema verifica que el usuario
cumple criterios mínimos antes de progresar. Basado en: Gabbett (2016) ACWR,
Bourdon et al. (2017) consenso monitoreo, Foster et al. (2001) session-RPE.

**Estructura `gate_criteria` JSON:**

```json
{
  "min_sessions_completed": 4,
  "max_rpe_avg": 4,
  "no_pain_48h": true,
  "min_completion_pct": 0.80,
  "override_after_weeks": 3,
  "fail_action": "repeat_block",
  "fail_message_es": "Repetimos este bloque una semana más. Tu cuerpo necesita más tiempo y eso está bien."
}
```

**Campos:**
- `min_sessions_completed`: Sesiones mínimas completadas en el bloque actual
- `max_rpe_avg`: RPE promedio debe ser ≤ este valor para avanzar
- `no_pain_48h`: No reportó dolor en las últimas 48h del bloque
- `min_completion_pct`: % mínimo de sesiones completadas (vs skipped)
- `override_after_weeks`: Semanas máximas en el mismo bloque antes de forzar avance (safety net)
- `fail_action`: `repeat_block` | `reduce_and_advance` | `lateral_move`
- `fail_message_es`: Mensaje al usuario cuando se repite

### Datos iniciales (gate_criteria por bloque):

```
RW × cero:      progresión por bloque (A→B→C→D), NO por semana
                 gate A→B: RPE ≤ 4, sin dolor 48h, 4+ sesiones completadas
                 gate B→C: RPE ≤ 4, sin dolor 48h, 4+ sesiones completadas
                 gate C→D: RPE ≤ 5, sin dolor 48h, 6+ sesiones completadas
                 override: max 3 semanas en un mismo bloque
                 (Galloway 2016, Fokkema et al. 2019)

RS × nuevo:     +5 min/sem, max 6 sem, deload cada 4, -20%
RS × base:      +5 min/sem, max 8 sem, deload cada 4, -20%, agrega ST en sem 3
RS × avanzado:  +3 min/sem (más lento), max 10 sem, deload cada 3, -15%

SC × nuevo:     +2 reps/sem (de 6 a 10), max 4 sem, luego sube duración rep
SC × base:      +duración rep (+15s/sem), max 6 sem, deload cada 4

TL × base:      +10 min/sem, max 8 sem, deload cada 4, -25%
TLM × base:     +10 min/sem, max 10 sem, deload cada 4, -20%

FE × todos:     +1 set cada 3 semanas, max 4 sets, no deload (es prevención)

SMC × nuevo:    +1 repeat del circuito cada 2 semanas, max 5 repeats
SMC × base:     +5 min/sem al bloque principal

RP × base:      bloque firme +1 min/sem (de 3 a 8 min)
RP × avanzado:  bloque firme +1 min/sem (de 5 a 12 min)

GATE CRITERIA (v2) — Criterios de paso para bloques con nivel cero/nuevo:
─────────────────────────────────────────────────────────────────────────
RW (todos):     gate por bloque (A/B/C/D), ver arriba
RS × nuevo:     gate: RPE avg ≤ 5, completó ≥ 80% sesiones, sin dolor 48h
                avanza: sube +5 min. No avanza: repite semana con misma duración
SC × nuevo:     gate: RPE avg ≤ 5, completó ≥ 80%, sin dolor articular
                avanza: +2 reps. No avanza: mantiene reps, reduce duración rep
TLM × base:     gate: RPE avg ≤ 6, completó tirada previa sin caminar >30%
                avanza: +10 min. No avanza: repite misma duración
```

---

## 4. TEMPLATES DE PLAN (combinan bloques en semanas)

### `plan_templates` — Plan base por perfil

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| id | UUID | PK | |
| code | VARCHAR | Código único del template | `desde_cero_3d` |
| profile | ENUM | `cero`, `nuevo`, `calle_trail` | `cero` |
| goal_context | ENUM | `calle`, `montana`, `calle_trail` | `calle` |
| level | ENUM | `cero`, `nuevo`, `base`, `avanzado` | `cero` |
| days_per_week | INT | | 3 |
| total_weeks | INT | Duración del plan | 8 |
| name_es | VARCHAR | Nombre visible | "Empezá a Correr" |
| description_es | TEXT | Descripción | "Tu primer plan para..." |
| phase_structure | JSONB | Fases del plan | ver abajo |

### Ejemplo `phase_structure` para `desde_cero_3d` (v2):

```json
{
  "phases": [
    {
      "name": "Adaptación",
      "weeks": [1, 2],
      "focus": "habito_y_confianza",
      "message": "El objetivo es que vengas, no que sufras",
      "gate_criteria": {
        "max_rpe_avg": 4,
        "no_pain_48h": true,
        "min_sessions_completed": 4,
        "min_completion_pct": 0.80,
        "override_after_weeks": 3,
        "fail_action": "repeat_block",
        "fail_message_es": "Repetimos este bloque. Tu cuerpo necesita más tiempo y eso está perfecto."
      }
    },
    {
      "name": "Progresión 1",
      "weeks": [3, 4],
      "focus": "mas_trote_menos_caminata",
      "message": "Cada semana un poco más de trote. Sin prisa.",
      "gate_criteria": {
        "max_rpe_avg": 4,
        "no_pain_48h": true,
        "min_sessions_completed": 4,
        "min_completion_pct": 0.80,
        "override_after_weeks": 3,
        "fail_action": "repeat_block"
      }
    },
    {
      "name": "Progresión 2",
      "weeks": [5, 6],
      "focus": "bloques_largos",
      "message": "Ya corrés más de lo que caminás. Tu cuerpo se está adaptando.",
      "gate_criteria": {
        "max_rpe_avg": 5,
        "no_pain_48h": true,
        "min_sessions_completed": 4,
        "min_completion_pct": 0.80,
        "override_after_weeks": 3,
        "fail_action": "repeat_block"
      }
    },
    {
      "name": "Correr continuo",
      "weeks": [7, 8],
      "focus": "primer_rodaje_continuo",
      "message": "Tu primera media hora corriendo. Esto es tu Ritmo Real."
    }
  ],
  "graduation": {
    "condition": "30 min continuos RPE ≤ 5",
    "next_plan": "nuevo_calle_3d | nuevo_montana_3d",
    "message": "Ya podés correr 30 minutos. Ahora elegí tu camino: calle o montaña."
  }
}
```

### Ejemplo `phase_structure` para `nuevo_calle_3d`:

```json
{
  "phases": [
    {
      "name": "Construir hábito",
      "weeks": [1, 2],
      "focus": "consistencia",
      "message": "El objetivo es que vengas, no que sufras",
      "gate_criteria": {
        "max_rpe_avg": 5,
        "no_pain_48h": true,
        "min_completion_pct": 0.80,
        "override_after_weeks": 3,
        "fail_action": "repeat_block"
      }
    },
    {
      "name": "Construir base",
      "weeks": [3, 4],
      "focus": "volumen_suave",
      "message": "Tu cuerpo está aprendiendo a correr eficiente",
      "gate_criteria": {
        "max_rpe_avg": 5,
        "no_pain_48h": true,
        "min_completion_pct": 0.80,
        "override_after_weeks": 3,
        "fail_action": "repeat_block"
      }
    },
    {
      "name": "Consolidar",
      "weeks": [5, 6],
      "focus": "resistencia",
      "message": "Ya tenés base. Ahora la sostenemos"
    },
    {
      "name": "Probar límites suaves",
      "weeks": [7, 8],
      "focus": "test",
      "message": "Semana 7 es tu prueba. Semana 8 descansamos"
    }
  ]
}
```

---

## 5. SESIONES DENTRO DEL TEMPLATE

### `template_sessions` — Qué bloques van en cada día de cada semana

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| id | UUID | PK | |
| template_id | UUID FK | Plan al que pertenece | → nuevo_calle_3d |
| week_number | INT | Semana del plan | 1 |
| day_of_week | INT | 1=lun, 7=dom | 1 |
| day_label | VARCHAR | Etiqueta del día | "Día 1" |
| session_name_es | VARCHAR | Nombre de la sesión | "Empezar a Moverse" |
| blocks | JSONB | Bloques que componen la sesión | ver abajo |
| is_deload | BOOL | Es semana de descarga? | false |
| is_optional | BOOL | Sesión opcional? | false |
| tip_category | VARCHAR | Categoría de tip educativo | "respiracion" |

### Ejemplo `blocks` JSON:

```json
[
  {
    "block_code": "RA",
    "variant_level": "nuevo",
    "variant_context": "calle",
    "duration_override_min": null,
    "order": 1,
    "is_primary": true
  },
  {
    "block_code": "MF",
    "variant_level": "nuevo",
    "variant_context": "calle",
    "duration_override_min": 5,
    "order": 2,
    "is_primary": false
  }
]
```

### Templates Completos:

#### `desde_cero_3d` (Cero × Calle × 3 días × 8 semanas) — NUEVO v2

Modelo C25K adaptado con criterio de paso por respuesta (no por calendario).
Cada "bloque" dura 2 semanas MÍNIMO. Si no cumple gate criteria, se repite.
Ref: Galloway (2016), Fokkema et al. (2019), Foster et al. (2001).

```
BLOQUE A — ADAPTACIÓN (sem 1-2, gate: RPE ≤ 4, sin dolor 48h)
  Día 1 (Lun): "Empezar a Moverse"       → [RW(A: 1'trote/4'caminar)] 30min
  Día 2 (Mié): "Fuerza Básica"            → [FG light + MF] 20min
  Día 3 (Sáb): "Segundo Paso"             → [RW(A)] 30min
  Opcional: 1 día extra caminar 30-40' (Z1 pura)

BLOQUE B — PROGRESIÓN 1 (sem 3-4, gate: RPE ≤ 4, sin dolor 48h)
  Día 1: "Más Trote"                      → [RW(B: 3'trote/2'caminar)] 30min
  Día 2: "Fuerza + Core"                  → [FG + MF] 20min
  Día 3: "Rodaje Run-Walk"                → [RW(B)] 30min
  Opcional: 1 día caminar 30-40'

BLOQUE C — PROGRESIÓN 2 (sem 5-6, gate: RPE ≤ 5, sin dolor 48h)
  Día 1: "Bloques Más Largos"             → [RW(C: 5'trote/2'caminar)] 35min
  Día 2: "Fuerza"                         → [FG + FE intro] 25min
  Día 3: "Run-Walk Sostenido"             → [RW(C)] 35min

BLOQUE D — CORRER CONTINUO (sem 7-8)
  Día 1: "Primer Rodaje Continuo"         → [RS(cero→nuevo)] 20-25min continuo
  Día 2: "Fuerza"                         → [FG] 25min
  Día 3: "Tu Primera Media Hora"          → [RS] 25-30min continuo

  Meta final: 30 min continuos en Z1-Z2 (conversacional).
  Si completa → pasa a plan nuevo_calle_3d o nuevo_montana_3d.
```

#### `nuevo_calle_3d` (Nuevo × Calle × 3 días × 8 semanas)

```
SEM 1:
  Día 1 (Lun): "Empezar a Moverse"      → [RA] 25min
  Día 2 (Mié): "Fuerza Base"             → [FG + MF] 20min
  Día 3 (Sáb): "Primer Rodaje"           → [RS(nuevo,calle)] 25min

SEM 2:
  Día 1: "Moverse Más"                   → [RA] 25min
  Día 2: "Fuerza Base"                   → [FG + MF] 20min
  Día 3: "Rodaje Sostenible"             → [RS] 30min (+5)

SEM 3:
  Día 1: "Rodaje Suave"                  → [RS] 25min
  Día 2: "Fuerza + Core"                 → [FG] 25min
  Día 3: "Rodaje Creciendo"              → [RS] 35min (+5)

SEM 4 (DELOAD):
  Día 1: "Recuperación"                  → [RA] 20min
  Día 2: "Movilidad"                     → [MF] 15min
  Día 3: "Rodaje Suave"                  → [RS] 25min (-20%)

SEM 5:
  Día 1: "Rodaje Base"                   → [RS] 30min
  Día 2: "Fuerza"                        → [FG] 25min
  Día 3: "Rodaje + Progresivo"           → [RP(nuevo,calle)] 35min

SEM 6:
  Día 1: "Rodaje Base"                   → [RS] 35min
  Día 2: "Fuerza"                        → [FG] 25min
  Día 3: "Rodaje Largo"                  → [TL(nuevo,calle)] 45min

SEM 7:
  Día 1: "Rodaje Firme"                  → [RS] 35min
  Día 2: "Fuerza"                        → [FG + PL] 30min
  Día 3: "Tu Primer Test"                → [TL] 50min

SEM 8 (DELOAD):
  Día 1: "Regenerativo"                  → [RA] 20min
  Día 2: "Movilidad"                     → [MF] 15min
  Día 3: "Rodaje Celebración"            → [RS] 30min
```

#### `nuevo_montana_3d` (Nuevo × Montaña × 3 días × 8 semanas)

```
SEM 1:
  Día 1 (Lun): "Base Aeróbica"           → [RS(nuevo,trail)] 25min
  Día 2 (Mié): "Preparar el Cuerpo"      → [FE + FG] 25min
  Día 3 (Sáb): "Primer Contacto Trail"   → [CF + RA] 35min

SEM 2:
  Día 1: "Base Aeróbica"                 → [RS] 30min (+5)
  Día 2: "Fuerza Trail"                  → [FE + FG] 25min
  Día 3: "Subidas Suaves"                → [SC(nuevo) + CF] 35min

SEM 3:
  Día 1: "Rodaje + Terreno"              → [RS] 30min
  Día 2: "Fuerza Excéntrica"             → [FE] 25min
  Día 3: "Trail Mixto"                   → [SMC(nuevo)] 35min

SEM 4 (DELOAD):
  Día 1: "Recuperación"                  → [RA] 20min
  Día 2: "Movilidad"                     → [MF] 15min
  Día 3: "Caminata Montaña"              → [CF] 30min

SEM 5:
  Día 1: "Rodaje Base"                   → [RS] 35min
  Día 2: "Fuerza + Bajadas"              → [FE + TB(nuevo)] 30min
  Día 3: "Subidas Progresivas"           → [SC] 35min (8 reps)

SEM 6:
  Día 1: "Rodaje Sostenible"             → [RS] 35min
  Día 2: "Fuerza Trail"                  → [FE + PL] 30min
  Día 3: "Tirada Trail"                  → [TLM(nuevo)] 50min

SEM 7:
  Día 1: "Rodaje + Terreno"              → [RS] 40min
  Día 2: "Fuerza Completa"               → [FE + FG] 30min
  Día 3: "Tu Primer Trail Largo"         → [TLM] 60min

SEM 8 (DELOAD):
  Día 1: "Regenerativo"                  → [RA] 20min
  Día 2: "Movilidad"                     → [MF] 15min
  Día 3: "Trail Suave"                   → [CF + RA] 35min
```

#### `calle_trail_base_3d` (Calle→Trail × Base × 3 días × 12 semanas)

```
BLOQUE 1: MOTOR + PROTEGER (sem 1-4)

SEM 1:
  Día 1 (Mar): "Base Aeróbica"           → [RS(base,calle_trail)] 40min
  Día 2 (Jue): "Trail en Ciudad"         → [SMC(base)] 40min
  Día 3 (Sáb): "Tirada Sostenible"       → [TL(base)] 55min

SEM 2:
  Día 1: "Base + Strides"                → [RS + ST] 45min
  Día 2: "Trail Ciudad + Fuerza"         → [SMC + FE] 50min
  Día 3: "Tirada"                        → [TL] 60min (+5)

SEM 3:
  Día 1: "Base Aeróbica"                 → [RS + ST] 45min
  Día 2: "Subidas Intro"                 → [SC(base) + FE] 45min
  Día 3: "Tirada Ondulada"               → [TL terreno mixto] 65min

SEM 4 (DELOAD):
  Día 1: "Rodaje Suave"                  → [RS] 35min
  Día 2: "Movilidad + Fuerza Light"      → [MF + FE light] 30min
  Día 3: "Rodaje Fácil"                  → [RS] 40min

BLOQUE 2: SUBIR DESNIVEL (sem 5-8)

SEM 5:
  Día 1: "Base + Progresivo"             → [RP(base,calle_trail)] 50min
  Día 2: "Subidas Sostenidas"            → [SC + TB] 45min
  Día 3: "Tirada Montaña"               → [TLM(base)] 70min

SEM 6:
  Día 1: "Base Aeróbica"                 → [RS + ST] 45min
  Día 2: "Subidas + Bajadas"             → [SC + TB + FE] 50min
  Día 3: "Tirada Montaña"               → [TLM] 80min (+10)

SEM 7:
  Día 1: "Progresivo Trail"              → [RP trail] 50min
  Día 2: "Subidas Largas"                → [SC duración+] 50min
  Día 3: "Larga Montaña"                → [TLM] 85min

SEM 8 (DELOAD):
  Día 1: "Rodaje Suave"                  → [RS] 35min
  Día 2: "Movilidad"                     → [MF + FE light] 30min
  Día 3: "Trail Fácil"                  → [TLM suave] 60min

BLOQUE 3: SIMULAR CARRERA (sem 9-12)

SEM 9:
  Día 1: "Rodaje + Umbral Suave"         → [RP] 50min (8' firme)
  Día 2: "Subidas + Técnica"             → [SC + TB] 50min
  Día 3: "Larga de Montaña"             → [TLM] 95min

SEM 10:
  Día 1: "Base Aeróbica"                 → [RS + ST] 45min
  Día 2: "Subidas Fuertes Intro"         → [SF intro + TB] 45min
  Día 3: "Larga Montaña"                → [TLM] 105min

SEM 11:
  Día 1: "Rodaje Pre-Simulacro"          → [RS] 35min
  Día 2: "Fuerza Trail"                  → [FE + PL] 30min
  Día 3: "SIMULACRO: Mini Carrera"       → [TLM] 120min (ritmo carrera)

SEM 12 (DELOAD FINAL):
  Día 1: "Regenerativo"                  → [RA] 25min
  Día 2: "Movilidad"                     → [MF] 20min
  Día 3: "Trail de Celebración"          → [TLM suave] 60min
```

#### `calle_trail_avanzado_4d` (Calle→Trail × Avanzado × 4 días × 12 semanas)

```
SEM 1:
  Día 1 (Lun): "Rodaje + Strides"        → [RS + ST] 50min
  Día 2 (Mié): "Subidas Específicas"     → [SC 10×1min + TB] 50min
  Día 3 (Vie): "Fuerza Trail"            → [FE + PL + FG] 35min
  Día 4 (Dom): "Larga Montaña"           → [TLM] 90min

SEM 2:
  Día 1: "Progresivo"                    → [RP] 55min
  Día 2: "Subidas + Bajadas"             → [SC + TB] 55min
  Día 3: "Fuerza"                        → [FE + PL] 35min
  Día 4: "Larga"                         → [TLM] 95min

(... progresión similar, deload sem 4 y 8)

SEM 11:
  Día 1: "Umbral Controlado"             → [IU 4×6min] 50min
  Día 2: "Subidas Fuertes"               → [SF 6×2min + TB] 50min
  Día 3: "Fuerza Mantenimiento"          → [FE] 25min
  Día 4: "SIMULACRO"                     → [TLM] 150min
```

---

## 6. REGLAS DE ADAPTACIÓN POR BLOQUE

### `adaptation_rules` — Cómo el motor modifica cada bloque

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| block_code | VARCHAR FK | Bloque afectado |
| trigger_condition | ENUM | `fatiga_alta`, `dolor`, `baja_adherencia`, `progresion_positiva`, `rpe_alto` |
| action | ENUM | `reduce_duration`, `reduce_intensity`, `skip`, `replace`, `increase_duration`, `add_walk` |
| action_value | DECIMAL | Valor del ajuste |
| replacement_block_code | VARCHAR | Bloque de reemplazo (si action=replace) |
| message_es | TEXT | Mensaje al usuario |

### Datos iniciales:

```
RS × fatiga_alta       → reduce_duration × 0.85
                         "Bajamos un poco el rodaje para cuidar tu cuerpo"

RS × dolor             → replace → RA
                         "Hoy cambiamos a recuperación activa. Escuchá a tu cuerpo"

RS × progresion        → increase_duration × 1.05
                         "Tu cuerpo responde bien. Sumamos unos minutos"

SC × fatiga_alta       → reduce reps -2
                         "Menos repeticiones hoy, misma calidad"

SC × dolor             → replace → CF
                         "Hoy caminata fuerte en vez de subidas. Protegemos"

TL × fatiga_alta       → reduce_duration × 0.80
                         "Tirada más corta esta semana"

TL × dolor             → skip
                         "Saltamos la tirada larga. Tu cuerpo necesita descanso"

TLM × rpe_alto_prev    → add_walk (intercalar caminata)
                         "Agregamos bloques de caminata. En montaña caminar es correr"

FE × progresion        → increase (+1 set cada 3 sem)
                         "Sumamos un set. Tus piernas están más fuertes"

SMC × baja_adherencia  → reduce_duration × 0.80
                         "Sesión más corta para que sea más fácil completarla"

ANY × dolor            → insert MF before
                         "Empezamos con movilidad hoy"

ANY × 2_skips_seguidos → reduce days_per_week -1 (temporario)
                         "Ajustamos a menos días para que sea sostenible"
```

---

## 7. TIPS EDUCATIVOS (Pool rotativo)

### `education_tips`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| category | ENUM | `respiracion`, `esfuerzo`, `tecnica_trail`, `nutricion`, `prevencion`, `motivacion` |
| applicable_blocks | VARCHAR[] | Códigos de bloques donde aplica | `{RS, TL, TLM}` |
| level | ENUM | `nuevo`, `base`, `avanzado`, `todos` |
| goal_context | ENUM | `calle`, `trail`, `todos` |
| content_es | TEXT | |
| content_en | TEXT (nullable) | |
| show_max_times | INT | Máximo de veces que se muestra | 3 |

### Tips iniciales:

```
RESPIRACIÓN
  [RS,TL,TLM] nuevo/todos: "Si no podés respirar por la nariz, estás yendo demasiado rápido"
  [RS,TL] base/todos: "Intentá 3 pasos inspirar, 3 pasos exhalar. Encontrá tu ritmo"
  [SC,CF] todos/trail: "En subida es normal respirar por la boca. El esfuerzo se mide por habla, no por respiración"

ESFUERZO
  [RS,RA] nuevo/todos: "Hoy no importa la distancia. Importa que termines con ganas de volver mañana"
  [RS,TL] base/todos: "Si podés hablar en frases completas, estás en tu Ritmo Real"
  [RP] base/todos: "El bloque firme debe sentirse controlado, no máximo. Podrías mantenerlo 5 min más"
  [TLM] base/trail: "Tu zona 2 en subida no es la misma que en llano. Dejá que el ritmo baje"

TÉCNICA TRAIL
  [SC,CF] todos/trail: "Subida: pasos cortos, apoyá todo el pie, usá los brazos"
  [TB] todos/trail: "Bajada: rodillas flexionadas, mirada adelante (no al pie), pasos rápidos y cortos"
  [SMC] todos/trail: "Las escaleras son tu mejor simulador de montaña en ciudad"
  [TLM] base/trail: "En montaña caminar fuerte en subida es válido. Los ultras lo hacen"

PREVENCIÓN
  [FE] todos/todos: "Los excéntricos protegen tus rodillas en bajadas. Es tu seguro de vida trail"
  [ANY] todos/trail: "Si sentís dolor agudo, pará. Dolor muscular post-entreno es normal. Dolor articular no"
  [TL,TLM] todos/todos: "Si tus piernas están destruidas 2 días después, la próxima tirada bajá 10%"

NUTRICIÓN
  [TL,TLM] base/trail: "En salidas de +60 min, llevá agua. En +90 min, algo de comer"
  [TLM] base/trail: "Practicá comer caminando en subida. En carrera va a ser tu momento de recarga"

MOTIVACIÓN
  [RS] nuevo/todos: "El 80% de los runners corren demasiado rápido. Vos estás aprendiendo a hacerlo bien"
  [ANY] nuevo/todos: "Cada sesión que completás te acerca. No importa si fue lenta"
  [TLM] base/trail: "Hoy estás entrenando para disfrutar la montaña. Eso ya te hace diferente"

NIVEL CERO — RUN-WALK (v2)
  [RW] cero/todos: "Caminar no es hacer trampa. Es parte del plan"
  [RW] cero/todos: "Si podés hablar mientras trotás, vas perfecto. Si no, caminá más"
  [RW] cero/todos: "No mires la velocidad. Hoy solo importa completar los minutos"
  [RW] cero/todos: "Cada bloque de trote que completás está construyendo tu motor aeróbico"
  [RW] cero/todos: "La gente que camina entre bloques de trote se lesiona 60% menos que la que fuerza"
  [FG] cero/todos: "La fuerza ahora te va a proteger después. Es tu inversión a futuro"
```

---

## 8. INSTANCIA DEL USUARIO

### `user_plan` — Plan asignado al usuario

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| user_id | UUID FK | |
| template_id | UUID FK | Template base asignado |
| started_at | TIMESTAMP | |
| current_week | INT | Semana actual |
| status | ENUM | `active`, `paused`, `completed` |
| adaptations_applied | INT | Cantidad de adaptaciones aplicadas |

### `user_sessions` — Lo que ve el usuario cada día

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| user_plan_id | UUID FK | |
| template_session_id | UUID FK | Sesión del template original |
| scheduled_date | DATE | |
| computed_blocks | JSONB | Bloques finales (con adaptaciones aplicadas) |
| computed_duration_min | INT | Duración total calculada |
| tip_id | UUID FK | Tip educativo seleccionado |
| status | ENUM | `pending`, `completed`, `skipped` |
| adaptation_log | JSONB | Qué adaptaciones se aplicaron y por qué |

### Ejemplo `computed_blocks` (después de adaptación):

```json
[
  {
    "block_code": "RS",
    "original_duration_min": 40,
    "adapted_duration_min": 34,
    "adaptation_reason": "fatiga_alta: reducido 15%",
    "variant_level": "base",
    "variant_context": "calle_trail",
    "structure": { ... phases ... }
  },
  {
    "block_code": "ST",
    "original_duration_min": 10,
    "adapted_duration_min": 0,
    "adaptation_reason": "fatiga_alta: eliminado strides",
    "status": "removed"
  }
]
```
