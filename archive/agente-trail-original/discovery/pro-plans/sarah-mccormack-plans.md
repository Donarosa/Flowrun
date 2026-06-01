# Trail Training Plans - Sarah McCormack (Inov-8)

Datos estructurados de los planes de entrenamiento. Cada plan está en un bloque YAML separado para fácil parsing.

## Tipos de sesión (enum)

- `rest`: descanso
- `easy`: corrida easy
- `hill_reps`: repeticiones de cuestas
- `fartlek`: fartlek estructurado
- `tempo`: tempo run
- `progression`: progression run
- `surges`: surges/strides
- `hill_fartlek`: fartlek en terreno ondulado
- `long_run`: salida larga
- `race`: día de carrera

## Niveles de esfuerzo (enum)

- `1h_race_pace`: 90% esfuerzo
- `1.5h_race_pace`: 80-90% esfuerzo
- `2h_race_pace`: 75-80% esfuerzo
- `3h_race_pace`: 65-70% esfuerzo
- `4h_race_pace`: ~60% esfuerzo
- `easy`: 30-40% esfuerzo

## Reglas comunes a todos los planes

```yaml
common_rules:
  warmup: "10-15 min calentamiento antes de sesiones estructuradas (incluyendo 4 x 10s strides)"
  cooldown: "10-15 min vuelta a la calma después"
  hill_alternatives:
    - "Bajar trotando y volver a subir hasta sumar el tiempo total"
    - "Tramo plano duro antes de enchufar la cuesta"
    - "Cinta con inclinación"
  adaptation:
    six_to_five_days: "Saltar el easy del sábado"
    six_to_four_days: "Saltar sábado + una sesión dura, manteniendo variedad (no descartar siempre cuestas o siempre fartleks)"
  strength: "1-2 sesiones de fuerza/condicionamiento por semana, no en días de descanso"
```

---

## Plan 1: Trail 10K (10 semanas)

```yaml
id: trail-10k
name: Trail 10K
weeks: 10
description: "Plan de 10 semanas para trail 10K"
prerequisites: "Mínimo 4 días de corrida por semana"
days_per_week: 6
adaptable_to: [4, 5]

schedule:
  - week: 1
    mon: { type: rest }
    tue: { type: hill_reps, description: "Hill reps piramidal: 60s - 90s - 2 min - 3 min - 2 min - 90s - 60s duro cuesta arriba. Trotar bajada después de cada rep" }
    wed: { type: easy, distance: "3 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: surges, description: "Flat surges: 6 x (20s rápido / 3 min trote easy)" }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "6 mi" }

  - week: 2
    mon: { type: rest }
    tue: { type: hill_reps, description: "5 x 2.5 min duro cuesta arriba, bajada trote easy" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: rest }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "7 mi" }

  - week: 3
    mon: { type: rest }
    tue: { type: hill_reps, description: "5 x 3 min duro cuesta arriba, bajada trote easy" }
    wed: { type: easy, distance: "3 mi" }
    thu: { type: easy, distance: "5 mi" }
    fri: { type: tempo, description: "Steady tempo: 15 min", effort: 2h_race_pace }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "8 mi" }

  - week: 4
    mon: { type: rest }
    tue: { type: surges, description: "Uphill surges: 6 x (30s rápido cuesta arriba / 2 min bajada y llano trote)" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "5 mi" }
    fri: { type: progression, description: "10 min @ 2h race pace (75-80%) + 5 min @ 40-60 min race pace (90-95%)" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "9 mi" }

  - week: 5
    mon: { type: rest }
    tue: { type: hill_reps, description: "4 x (4 min duro cuesta arriba / trote bajada)" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: surges, description: "Flat surges: 6 x (20s rápido / 3 min trote easy)" }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "7 mi" }

  - week: 6
    mon: { type: rest }
    tue: { type: tempo, description: "Steady tempo: 20 min", effort: 2h_race_pace }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "5 mi" }
    fri: { type: fartlek, description: "6 x (3 min fast tempo / 90s trote easy). 1h race pace (90%) en los 3 min" }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "10 mi" }

  - week: 7
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "25 min ondulada: duro en subidas, easy en llano y bajadas" }
    wed: { type: easy, distance: "6 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: rest }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "8 mi", description: "Con pickup: 5 mi easy + 2 mi @ 1.5h race pace (80%) + 1 mi easy" }

  - week: 8
    mon: { type: rest }
    tue: { type: hill_reps, description: "1-4-1-4-1-4 min duro cuesta arriba, trote bajada entre reps" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "6 mi" }
    fri: { type: fartlek, description: "6 x (4 min fast tempo / 2 min trote easy). 1h race pace (90%) en los 4 min" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "9 mi" }

  - week: 9
    mon: { type: rest }
    tue: { type: tempo, description: "Steady tempo: 25 min", effort: 2h_race_pace }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: hill_fartlek, description: "30 min ondulada: duro en subidas, easy en llano y bajadas" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "7 mi" }

  - week: 10
    mon: { type: rest }
    tue: { type: fartlek, description: "3-2-1-30s-3-2-1-30s min rápido pero relajado, 2 min trote entre. 1h race pace en 3 y 2 min; 30 min race pace en 1 min y 30s. Terminar con energía" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: rest }
    fri: { type: easy, distance: "3 mi", description: "Con 4 x 10s strides relajados" }
    sat: { type: rest }
    sun: { type: race }
```

---

## Plan 2: Trail Half Marathon (10 semanas)

```yaml
id: trail-half
name: Trail Half Marathon
weeks: 10
description: "Plan de 10 semanas para trail half marathon. Distancia oficial 13.1 mi pero pueden ir de 12 a 15 mi"
prerequisites: "5-6 días de corrida por semana acumulando 30-40 millas semanales"
days_per_week: 6
adaptable_to: [5]

schedule:
  - week: 1
    mon: { type: rest }
    tue: { type: hill_reps, description: "5 x 1 min duro cuesta arriba + 5 x 30s duro cuesta arriba. Trote a punto de partida entre reps" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "5 mi" }
    fri: { type: tempo, description: "Steady tempo: 15 min", effort: 2h_race_pace }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "8 mi" }

  - week: 2
    mon: { type: rest }
    tue: { type: hill_reps, description: "6 x 2 min duro cuesta arriba, trote a punto de partida entre reps" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "5 mi" }
    fri: { type: surges, description: "Flat surges: 6 x (20s rápido / 3 min trote easy)" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "9 mi" }

  - week: 3
    mon: { type: rest }
    tue: { type: hill_reps, description: "6 x 3 min duro cuesta arriba, trote a punto de partida entre reps" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: tempo, description: "Steady tempo: 20 min", effort: 2h_race_pace }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "10 mi" }

  - week: 4
    mon: { type: rest }
    tue: { type: tempo, description: "Steady tempo: 25 min", effort: 2h_race_pace }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: fartlek, description: "4 x (5 min fast tempo / 2 min trote easy). 1h race pace (90%) en los reps" }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "12 mi" }

  - week: 5
    mon: { type: rest }
    tue: { type: surges, description: "Flat surges: 6 x (20s rápido / 3 min trote easy)" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "5 mi" }
    fri: { type: progression, description: "10 min @ 2h race pace (75-80%) + 10 min @ 1h race pace (90-95%)" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "11 mi", description: "Con pickup: 8 mi easy + 2 mi @ 1.5h race pace (80%) + 1 mi easy" }

  - week: 6
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "25 min ondulada: duro en subidas, easy en llano y bajadas" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "3 mi" }
    fri: { type: fartlek, description: "5 x (5 min fast tempo / 2 min trote easy). 1h race pace en los 5 min" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "14 mi" }

  - week: 7
    mon: { type: rest }
    tue: { type: tempo, description: "Steady tempo: 30 min", effort: 2h_race_pace }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: fartlek, description: "3 x (8 min fast tempo / 3 min trote easy). 1h race pace en los 8 min" }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "15 mi" }

  - week: 8
    mon: { type: rest }
    tue: { type: progression, description: "15 min @ 2h race pace (75-80%) + 15 min @ 1h race pace (90-95%)" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: fartlek, description: "3 x (10 min fast tempo / 3 min trote easy). 1h race pace en los 10 min" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "12 mi" }

  - week: 9
    mon: { type: rest }
    tue: { type: fartlek, description: "2 x 4 min duro cuesta arriba con trote bajada. Después: 20 min de tempo ondulado @ 1.5h race pace (80-90%)" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: fartlek, description: "8-6-4-4 min fast tempo con 2 min trote entre reps. 1h race pace (90%)" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "8 mi" }

  - week: 10
    mon: { type: rest }
    tue: { type: fartlek, description: "5-3-3-1-1 min con 3 min trote entre reps. 1.5h race pace en el 5 min; 1h race pace en los 3 min; 30 min race pace en los 1 min. Terminar con energía" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: rest }
    fri: { type: easy, distance: "3 mi", description: "Con 4 x 10s strides relajados" }
    sat: { type: rest }
    sun: { type: race }
```

---

## Plan 3: Trail Marathon (16 semanas)

```yaml
id: trail-marathon
name: Trail Marathon
weeks: 16
description: "Plan de 16 semanas para trail marathon. Long runs con porcentaje del desnivel total de tu carrera"
prerequisites: "5-6 días de corrida por semana acumulando al menos 30-40 millas semanales"
days_per_week: 6
adaptable_to: [5]
fuelling_note: "Las sesiones marcadas con asterisco (*) son oportunidad para probar tu estrategia de combustible de carrera"

schedule:
  - week: 1
    mon: { type: rest }
    tue: { type: fartlek, description: "4 x 4 min fast tempo / 2 min trote easy. 1h race pace (90%)" }
    wed: { type: easy, distance: "6 mi" }
    thu: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    fri: { type: tempo, description: "15 min", effort: 2h_race_pace }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "8 mi", elevation_pct: 30 }

  - week: 2
    mon: { type: rest }
    tue: { type: fartlek, description: "6-4-4-6 min fast / 2 min trote easy. 1h race pace (90%)" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    fri: { type: tempo, description: "20 min", effort: 2h_race_pace }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "9 mi", elevation_pct: 30 }

  - week: 3
    mon: { type: rest }
    tue: { type: hill_reps, description: "4 x 2.5 min duro cuesta arriba, trote a punto de partida. Ritmo más rápido sostenible y consistente" }
    wed: { type: easy, distance: "6 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: fartlek, description: "6-4-2-2-4-6 min fast / 2 min trote easy. 1h race pace (90%)" }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "10 mi", elevation_pct: 35 }

  - week: 4
    mon: { type: rest }
    tue: { type: fartlek, description: "6 x 4 min fast tempo / 2 min trote easy. 1h race pace (90%)" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: hill_reps, description: "5 x 2.5 min duro cuesta arriba, trote bajada. Ritmo más rápido sostenible y consistente" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "11 mi", elevation_pct: 40 }

  - week: 5
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "20 min ondulada: duro en subidas (entre 20-min race pace en cortas y 90-min race pace en largas), easy en llano y bajadas" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: tempo, description: "2 x 12 min @ 2h race pace (75-80%) con 3 min trote entre reps", fuelling: true }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "13 mi", elevation_pct: 30 }

  - week: 6
    mon: { type: rest }
    tue: { type: progression, description: "20 min total: 10 min @ 2h race pace (75-80%) + 10 min @ 1h race pace (90-95%)" }
    wed: { type: easy, distance: "6 mi" }
    thu: { type: easy, distance: "6 mi", optional: true, note: "o descanso" }
    fri: { type: easy, distance: "4 mi", description: "Con 6 x 20s strides, 2-3 min trote easy entre cada aceleración" }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "9 mi", elevation_pct: 40, description: "En los últimos 10-15 min: 5 x 30s surges (no más rápido que 10k race pace) con 2-3 min trote entre, en llano firme" }

  - week: 7
    mon: { type: rest }
    tue: { type: fartlek, description: "8-4-6-4-4 min fast / 2 min trote easy entre reps. 1h race pace (90%)" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: tempo, description: "2 x 15 min @ 2h race pace (75-80%) con 3 min trote entre reps", fuelling: true }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "15 mi", elevation_pct: 50 }

  - week: 8
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "25 min ondulada: duro en subidas (20-min a 90-min race pace según largo), easy en llano y bajadas" }
    wed: { type: easy, distance: "7 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: easy, distance: "6 mi", description: "Con 6 x 20s strides, 2-3 min trote easy entre" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "12 mi", elevation_pct: 40, description: "En las últimas 3 mi: 10 min @ 2h race pace (75-80%)" }

  - week: 9
    mon: { type: rest }
    tue: { type: tempo, description: "En trail ondulado, 20 min @ 1h race pace (90-95%)" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: progression, description: "25 min total: 10 min @ 3h race pace (65-70%) + 10 min @ 2h race pace (75-80%) + 5 min @ 1h race pace (90-95%)", fuelling: true }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "17 mi", elevation_pct: 65 }

  - week: 10
    mon: { type: rest }
    tue: { type: hill_reps, description: "4 x 4 min duro cuesta arriba, trote bajada. Ritmo más rápido sostenible y consistente" }
    wed: { type: easy, distance: "7 mi" }
    thu: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    fri: { type: easy, distance: "4 mi", description: "Con 6 x 20s strides, 2-3 min trote easy entre" }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "10 mi", elevation_pct: 30, description: "Incluí 3 x 10 min @ 2h race pace (75-80%) con 5 min trote entre reps", fuelling: true }

  - week: 11
    mon: { type: rest }
    tue: { type: fartlek, description: "3 x 10 min fast / 3 min trote easy entre. 1h race pace (90%). Pasalo a miércoles si seguís cansado del domingo" }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    fri: { type: easy, distance: "4 mi", description: "Con 6 x 20s strides, 2-3 min trote easy entre" }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "20 mi", elevation_pct: 70 }

  - week: 12
    mon: { type: rest }
    tue: { type: progression, description: "30 min total: 10 min @ 3h race pace (65-70%) + 10 min @ 2h race pace (75-80%) + 10 min @ 1h race pace (90-95%)", fuelling: true }
    wed: { type: easy, distance: "6 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: easy, distance: "6 mi", description: "Con 6 x 20s strides, 2-3 min trote easy entre" }
    sat: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "10 mi", elevation_pct: 20, description: "Incluí 3 x 15 min @ 3h race pace (65-70%) con 5 min trote entre reps. ALTERNATIVA: 10-mile o half marathon de trail como carrera de preparación", fuelling: true }

  - week: 13
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "30 min ondulada: duro en subidas, easy en llano y bajadas" }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: tempo, description: "40 min @ 3h race pace (65-75%)", fuelling: true }
    sat: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "18 mi", elevation_pct: 75 }

  - week: 14
    mon: { type: rest }
    tue: { type: hill_reps, description: "5 x 4 min duro cuesta arriba, trote bajada. Ritmo más rápido sostenible y consistente" }
    wed: { type: easy, distance: "7 mi" }
    thu: { type: easy, distance: "5 mi", optional: true, note: "o descanso" }
    fri: { type: easy, distance: "4 mi", description: "Con 6 x 20s strides, 2-3 min trote easy entre" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "14 mi", elevation_pct: 50, description: "Incluí 2 x 20 min @ 3h race pace (65-70%) con 5 min trote entre reps", fuelling: true }

  - week: 15
    mon: { type: rest }
    tue: { type: progression, description: "30 min total: 20 min @ 3h race pace (65-70%) + 10 min @ 1h race pace (90-95%)", fuelling: true }
    wed: { type: easy, distance: "5 mi" }
    thu: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    fri: { type: fartlek, description: "4 x 4 min fast tempo / 2 min trote easy. 1h race pace (90%)" }
    sat: { type: easy, distance: "4 mi", optional: true, note: "o descanso" }
    sun: { type: long_run, distance: "7 mi", elevation_pct: 20 }

  - week: 16
    mon: { type: rest }
    tue: { type: tempo, description: "10 min steady", effort: 3h_race_pace }
    wed: { type: easy, distance: "4 mi" }
    thu: { type: rest }
    fri: { type: easy, distance: "3 mi", description: "Con 6 x 20s strides rápidos pero no extenuantes, 2-3 min trote easy entre" }
    sat: { type: easy, distance: "2 mi", optional: true, note: "o descanso" }
    sun: { type: race }
```

---

## Plan 4: 50 Mile Beginner (16 semanas)

```yaml
id: 50-mile-beginner
name: 50 Mile Beginner
weeks: 16
description: "Plan de 16 semanas para 50 millas. Incluye caminatas largas en cerro para entrenar el caminar en carrera"
prerequisites: "Haber completado al menos un trail half marathon. Corre regularmente hace menos de 2 años o no acostumbrado a sesiones estructuradas de velocidad"
days_per_week: 5
adaptable_to: [4, 6]

schedule:
  - week: 1
    mon: { type: rest }
    tue: { type: easy, distance: "5 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_reps, description: "5 x 2 min duro cuesta arriba, trote a punto de partida. Ritmo más rápido sostenible y consistente" }
    fri: { type: rest }
    sat: { type: easy, distance: "5 mi" }
    sun: { type: long_run, distance: "10 mi", elevation_pct: 20 }

  - week: 2
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_reps, description: "5 x 2.5 min duro cuesta arriba, trote a punto de partida" }
    fri: { type: rest }
    sat: { type: easy, distance: "5 mi" }
    sun: { type: long_run, distance: "12 mi", elevation_pct: 25 }

  - week: 3
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_reps, description: "5 x 3 min duro cuesta arriba, trote a punto de partida" }
    fri: { type: rest }
    sat: { type: easy, distance: "4 mi" }
    sun: { type: long_run, distance: "14 mi", elevation_pct: 30 }

  - week: 4
    mon: { type: rest }
    tue: { type: easy, distance: "5 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_reps, description: "4 x 2 min duro cuesta arriba, trote a punto de partida" }
    fri: { type: rest }
    sat: { type: easy, distance: "5 mi" }
    sun: { type: long_run, distance: "12 mi", elevation_pct: 25 }

  - week: 5
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: tempo, description: "15 min", effort: 3h_race_pace, fuelling: true }
    fri: { type: rest }
    sat: { type: easy, distance: "3 mi" }
    sun: { type: long_run, distance: "16 mi", elevation_pct: 35, fuelling: true }

  - week: 6
    mon: { type: rest }
    tue: { type: easy, distance: "5 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_fartlek, description: "20 min ondulada: duro en subidas (40-60 min race pace), easy en llano y bajadas" }
    fri: { type: rest }
    sat: { type: easy, distance: "6 mi" }
    sun: { type: hike, description: "Caminata en cerro de 4-5 h" }

  - week: 7
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: tempo, description: "20 min", effort: 3h_race_pace, fuelling: true }
    fri: { type: rest }
    sat: { type: easy, distance: "4 mi" }
    sun: { type: long_run, distance: "18 mi", elevation_pct: 40, fuelling: true }

  - week: 8
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi", fuelling: true }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_fartlek, description: "25 min ondulada: duro en subidas (40-60 min race pace), easy en llano y bajadas" }
    fri: { type: rest }
    sat: { type: easy, distance: "7 mi" }
    sun: { type: hike, description: "Caminata en cerro de 6-7 h" }

  - week: 9
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_reps, description: "5 x (1 min duro cuesta arriba / 1 min bajada easy) + 3 min trote easy + 15 min tempo @ 3h race pace (65-70%)" }
    fri: { type: rest }
    sat: { type: easy, distance: "5 mi" }
    sun: { type: long_run, distance: "20 mi", elevation_pct: 40, fuelling: true }

  - week: 10
    mon: { type: rest }
    tue: { type: easy, distance: "5 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: easy, distance: "4 mi" }
    fri: { type: rest }
    sat: { type: easy, distance: "6 mi" }
    sun: { type: long_run, distance: "10 mi", elevation_pct: 15 }

  - week: 11
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_fartlek, description: "Hill alternations 20 min: todas las subidas duro (40-60 min race pace), llanos y bajadas moderado @ 3h race pace (65-70%)", fuelling: true }
    fri: { type: rest }
    sat: { type: easy, distance: "4 mi" }
    sun: { type: long_run, distance: "22 mi", elevation_pct: 40, fuelling: true }

  - week: 12
    mon: { type: rest }
    tue: { type: easy, distance: "5 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: tempo, description: "2 x 15 min @ 3h race pace (65-70%) con 5 min trote easy entre reps", fuelling: true }
    fri: { type: rest }
    sat: { type: easy, distance: "7 mi" }
    sun: { type: hike, description: "Caminata en cerro de 6-7 h" }

  - week: 13
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: hill_fartlek, description: "Hill alternations 25 min: subidas duro (40-60 min race pace), llanos y bajadas @ 3h race pace (65-70%)", fuelling: true }
    fri: { type: rest }
    sat: { type: easy, distance: "3 mi" }
    sun: { type: long_run, distance: "25 mi", elevation_pct: 50, fuelling: true }

  - week: 14
    mon: { type: rest }
    tue: { type: easy, distance: "5 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: tempo, description: "2 x 20 min @ 3h race pace (65-70%) con 5 min trote easy entre reps", fuelling: true }
    fri: { type: rest }
    sat: { type: easy, distance: "6 mi" }
    sun: { type: long_run, distance: "12 mi", elevation_pct: 20 }

  - week: 15
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: surges, description: "Relaxed surges run: incluí 4 x 2 min @ 1.5h race pace con 3 min trote easy entre" }
    fri: { type: rest }
    sat: { type: easy, distance: "4 mi" }
    sun: { type: long_run, distance: "7 mi", elevation_pct: 10 }

  - week: 16
    mon: { type: rest }
    tue: { type: easy, distance: "4 mi" }
    wed: { type: easy, distance: "3 mi", optional: true, note: "o descanso" }
    thu: { type: easy, distance: "3 mi" }
    fri: { type: rest }
    sat: { type: easy, distance: "2 mi" }
    sun: { type: race }
```

---

## ~~Plan 5: 50 Mile Improver~~ — ELIMINADO

El plan original venía incompleto: el PDF de Sarah McCormack sólo detallaba Mar/Mié/Jue, dejando Vie/Sáb/Dom como `tbd`. Decisión 2026-05-18: eliminarlo del catálogo PRO hasta tener los días faltantes confirmados. El catálogo PRO queda con 5 planes (10K, Half, Marathon, 50 Mile Beginner, 100K).

---

## Plan 5: 100K (16 semanas)

```yaml
id: 100k
name: 100K Ultramarathon
weeks: 16
description: "Plan de 16 semanas para 100K trail. 100K son poco más de 60 millas, dos marathons seguidos y un poco más"
prerequisites: "Corredor experimentado: 2 sesiones duras por semana habituales, mínimo 70-80 km semanales, al menos 2 ultramaratones completados"
days_per_week: 6
adaptable_to: [5]
units: km
fuelling_note: "Las sesiones marcadas con asterisco (*) son oportunidad para probar tu estrategia de combustible de carrera"

schedule:
  - week: 1
    mon: { type: rest }
    tue: { type: hill_reps, description: "5 x 2.5 min duro cuesta arriba, trote a punto de partida. Ritmo más rápido sostenible y consistente" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "8K", description: "Con 6 x 20s strides (llano)" }
    fri: { type: tempo, description: "25 min steady", effort: 3h_race_pace }
    sat: { type: easy, distance: "10K", terrain: hilly_trail }
    sun: { type: long_run, distance: "25K", elevation_pct: 25 }

  - week: 2
    mon: { type: rest }
    tue: { type: hill_reps, description: "5 x 3 min duro cuesta arriba, trote a punto de partida. Ritmo más rápido sostenible y consistente" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: tempo, description: "30 min steady @ 3h race pace (60%)" }
    sat: { type: easy, distance: "12K", terrain: hilly_trail }
    sun: { type: long_run, distance: "20K", elevation_pct: 15, description: "En los últimos 20 min: 10 min @ 2h race pace (80%)" }

  - week: 3
    mon: { type: rest }
    tue: { type: fartlek, description: "6 x 3 min duro con 90s trote easy entre reps" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: progression, description: "20 min @ 3h race pace (65%) + 10 min @ 2h race pace (80%)" }
    sat: { type: easy, distance: "8K", terrain: hilly_trail }
    sun: { type: long_run, distance: "30K", elevation_pct: 30 }

  - week: 4
    mon: { type: rest }
    tue: { type: hill_reps, description: "5 x 4 min duro cuesta arriba, trote a punto de partida. Ritmo más rápido sostenible y consistente" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "8K", description: "Con 6 x 20s strides (llano)" }
    fri: { type: tempo, description: "2 x 20 min steady @ 3h race pace (60%) con 5 min trote easy entre reps", fuelling: true }
    sat: { type: easy, distance: "12K", terrain: hilly_trail }
    sun: { type: long_run, distance: "20K", elevation_pct: 20 }

  - week: 5
    mon: { type: rest }
    tue: { type: fartlek, description: "6 x 4 min duro con 2 min trote easy entre reps" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: fartlek, description: "Alternation: 5 x (1 min @ 1h race pace 90% / 5 min @ 3h race pace 65%)" }
    sat: { type: easy, distance: "8K", terrain: hilly_trail }
    sun: { type: long_run, distance: "35K", elevation_pct: 40 }

  - week: 6
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "30 min: duro en todas las subidas, easy en llanos y bajadas" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "10K", terrain: flat }
    fri: { type: easy, distance: "8K", description: "Con 6 x 20s strides" }
    sat: { type: easy, distance: "12K", terrain: hilly_trail }
    sun: { type: long_run, distance: "20K", elevation_pct: 15, description: "Incluí 45 min @ 3h race pace (65%)", fuelling: true }

  - week: 7
    mon: { type: rest }
    tue: { type: easy, distance: "10K" }
    wed: { type: fartlek, description: "8-6-6-4 min duro con 2 min trote easy entre reps" }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: easy, distance: "6K" }
    sat: { type: progression, description: "20 min @ 3h race pace (65%) + 20 min @ 2h race pace (80%)", fuelling: true }
    sun: { type: long_run, distance: "40K", elevation_pct: 40 }

  - week: 8
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "40 min: duro en todas las subidas, easy en llanos y bajadas" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: easy, distance: "10K", description: "Con 6 x 20s strides" }
    sat: { type: easy, distance: "8K", terrain: hilly_trail }
    sun: { type: long_run, distance: "20K", elevation_pct: 15, description: "Incluí 60 min @ 3h race pace (65%)", fuelling: true }

  - week: 9
    mon: { type: rest }
    tue: { type: easy, distance: "10K" }
    wed: { type: fartlek, description: "4 x 7.5 min duro con 2.5 min trote easy entre reps" }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: easy, distance: "6K" }
    sat: { type: progression, description: "20 min @ 3h race pace (65%) + 15 min @ 2h race pace (80%) + 5 min @ 1h race pace (90%)", fuelling: true }
    sun: { type: long_run, distance: "45K", elevation_pct: 50, description: "Alternativa: trail marathon como carrera de preparación" }

  - week: 10
    mon: { type: rest }
    tue: { type: hill_fartlek, description: "40 min: duro en todas las subidas (1h race pace 90%), llanos y bajadas a 3-4h race pace" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "10K", terrain: flat }
    fri: { type: easy, distance: "10K", description: "Con 6 x 20s strides" }
    sat: { type: easy, distance: "12K", terrain: hilly_trail }
    sun: { type: long_run, distance: "25K", elevation_pct: 25, description: "Incluí 75 min @ 4h race pace", fuelling: true }

  - week: 11
    mon: { type: rest }
    tue: { type: easy, distance: "10K" }
    wed: { type: hill_reps, description: "4 x 2 min duro cuesta arriba con trote bajada + 25 min tempo @ 2h race pace (80-85%)" }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: easy, distance: "8K" }
    sat: { type: easy, distance: "5K", terrain: hilly_trail }
    sun: { type: long_run, distance: "50K", elevation_pct: 50 }

  - week: 12
    mon: { type: rest }
    tue: { type: easy, distance: "8K" }
    wed: { type: easy, distance: "10K", terrain: hilly_trail }
    thu: { type: easy, distance: "14K", terrain: flat }
    fri: { type: easy, distance: "10K", description: "Con 6 x 20s strides" }
    sat: { type: easy, distance: "8K", terrain: hilly_trail }
    sun: { type: long_run, distance: "30K", elevation_pct: 25, description: "Incluí 90 min @ 4h race pace", fuelling: true }

  - week: 13
    mon: { type: rest }
    tue: { type: easy, distance: "10K" }
    wed: { type: fartlek, description: "3 x 8 min duro con 3 min trote easy entre reps" }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: easy, distance: "6K" }
    sat: { type: fartlek, description: "Alternation: 3 x (5 min @ 1h race pace 90% / 15 min steady @ 4h race pace)" }
    sun: { type: long_run, distance: "45K", elevation_pct: 35 }

  - week: 14
    mon: { type: rest }
    tue: { type: easy, distance: "8K" }
    wed: { type: easy, distance: "8K", terrain: hilly_trail }
    thu: { type: hill_fartlek, description: "40 min: duro en subidas (1h race pace 90%), llanos y bajadas a 3-4h race pace" }
    fri: { type: easy, distance: "10K" }
    sat: { type: easy, distance: "12K", terrain: hilly_trail }
    sun: { type: long_run, distance: "25K", elevation_pct: 25, description: "Incluí 60 min @ 4h race pace", fuelling: true }

  - week: 15
    mon: { type: rest }
    tue: { type: easy, distance: "8K" }
    wed: { type: progression, description: "40 min @ 4h race pace + 10 min @ 2h race pace (80%)" }
    thu: { type: easy, distance: "8K", terrain: flat }
    fri: { type: easy, distance: "6K" }
    sat: { type: tempo, description: "30 min steady @ 3h race pace (60%)" }
    sun: { type: long_run, distance: "15K", elevation_pct: 10 }

  - week: 16
    mon: { type: rest }
    tue: { type: easy, distance: "8K", description: "En los últimos 20 min: 10 min @ 3h race pace (65-70%)" }
    wed: { type: easy, distance: "8K", terrain: hilly_trail }
    thu: { type: easy, distance: "6K", description: "Con 4 x 20s strides relajados (llano)" }
    fri: { type: rest }
    sat: { type: easy, distance: "3K", terrain: hilly_trail }
    sun: { type: race }
```

---

## Notas adicionales

### Carreras de preparación
- **Trail Marathon**: semana 12 es ideal para meter un trail de 10 mi o medio maratón. Puede ser cualquier fin de semana entre semanas 9 y 13.
- **100K**: semana 9 ideal para un trail marathon como preparación. Si lo hacés: saltá el viernes duro y la mayoría de las sesiones duras de la semana siguiente.

### Kit list ultramaratones
- Campera impermeable (a veces también pantalón)
- Gorro, guantes
- Bebida (suele haber mínimo obligatorio), comida de emergencia
- Celular, posiblemente efectivo
- Mapa, posiblemente brújula
- Ropa de repuesto
- Linterna frontal con baterías de repuesto
- Silbato, manta de emergencia, botiquín
- Chaleco de hidratación con buen volumen
