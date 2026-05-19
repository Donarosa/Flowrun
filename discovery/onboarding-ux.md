# Onboarding UX — FlowRun

Fecha: 2026-05-18 (v4 — login antes de onboarding, fusión objetivo+experiencia en una sola pregunta de "pista", Strava post-onboarding)
Historial: v3 (2026-03-31) carrusel visual + validación inversa · v2 (2026-03-18) nivel cero + run-walk

---

## Principios

### Que se sienta personalizado
El secreto no es que el plan SEA único. Es que:
- Se adapta
- Se explica
- Tiene feedback
- Tiene narrativa de progreso

### Diseñar para confianza, no velocidad (v3)
Cada pantalla debe reducir una ansiedad concreta del usuario:
- ¿Puedo hacerlo? → Validación de nivel + estimación realista
- ¿Me voy a lesionar? → Tono protector + educación integrada
- ¿Me alcanza el tiempo? → Días disponibles + plan adaptado
- ¿Esto funciona? → Estimación antes/después con datos

Referencia: Runna tiene 30 pantallas / 12 min de onboarding. No es un problema si cada paso construye confianza. No buscar velocidad, buscar que el usuario termine sintiéndose capaz.

### Una sola pregunta sobre tu objetivo (v4)
En v2/v3 preguntábamos "Objetivo" + "Experiencia" en pantallas separadas y mapeábamos internamente. En v4 fusionamos ambas en una **pregunta única de "pista"** donde el usuario elige directamente el carril que le corresponde. Más rápido, más claro, menos ambigüedad.

---

## Flujo de Pantallas (v4)

### Pantalla 0 — Welcome (carrusel auto-play tipo Instagram Stories)

Carrusel que avanza solo (3-4 seg por slide). Máximo 9 palabras por headline. La imagen hace el trabajo pesado.

| Slide | Imagen | Texto |
|-------|--------|-------|
| 1 | Persona corriendo relajada, naturaleza | "Corré al ritmo correcto" |
| 2 | Mockup del plan semanal en la app | "Un plan que se adapta a vos" |
| 3 | Pantalla de check-in / feedback | "Feedback real, no felicitaciones vacías" |
| 4 | Persona en trail sonriendo | "De la calle a la montaña, sin lesiones" |

- Barra de progreso tipo Stories arriba
- Botón [Empezar] fijo en la parte inferior → lleva a Login
- Se puede tocar para avanzar o dejar que avance solo

### Pantalla 1 — Login / Signup (NUEVO v4)

Auth simple antes de cualquier onboarding. Sin email gates: opciones rápidas.
- Continuar con Apple
- Continuar con Google
- Continuar con email
- Link pequeño: "Ya tengo cuenta"

**Por qué login antes**: para guardar el resultado del onboarding contra una cuenta real. Evita perder progreso si el usuario cierra. Strava NO acá — se pide adentro de la app.

### Pantalla 2 — ¿Qué querés hacer? (NUEVO v4 · fusiona objetivo + experiencia)

Una sola pregunta, 4 pistas claras:

```
¿Qué querés hacer?

🌱 Empezar a correr de cero
   "Nunca corrí o hace mucho que no corro"

🏙️→⛰️ De la calle a la montaña
   "Ya corro en ciudad y quiero ir al trail"

⛰️ Mejorar en trail
   "Ya corro en montaña, quiero disfrutar más"

🔥 Planes Avanzados
   "Entrená con los planes de Sarah, campeona del mundo de trail"
```

**Posicionamiento de "Planes Avanzados" (v4)**: esta pista se destaca visualmente (fondo oscuro) pero **no es un tier de precio**. Toda la app es paga después de los 15 días de trial, y todas las pistas vienen incluidas en la misma suscripción. La diferenciación visual sólo marca que es **contenido para corredores con más experiencia** (planes por distancia de carrera, periodización compleja, fuelling sessions).

**⚠ Aclaración de naming (2026-05-18)**: previamente se usaba "PRO" como label, lo que generaba confusión:
- Sugería "tier premium pago" → falso, toda la app es paga
- Sugería "para profesionales" → es para "personas que ya corren mucho", no para profesionales
- El cambio a "Avanzados" elimina ambas ambigüedades

**⚠ Atribución (decisión 2026-05-18, opción "muy cauta")**: la UI **no menciona el apellido McCormack ni la marca inov-8**. Sólo "Sarah" + "campeona del mundo de trail". La atribución completa (nombre + apellido + fuente inov-8 + crédito a planes públicos) vive sólo en los **Términos y Condiciones** como cobertura legal de cita de fuente. Razón: bajar la exposición al "right of publicity" en EEUU y al uso de marca registrada inov-8 sin licencia. Trade-off asumido: "Sarah" sin apellido es ambiguo, pero el usuario priorizó cautela legal sobre credibilidad de marca.

#### Pantalla 2a — Sub-pregunta (sólo si elige "Empezar de cero")
```
¿Dónde te imaginás corriendo?

🏙️ En calle / ciudad      → desde_cero_3d → gradúa a nuevo_calle_3d
⛰️ En montaña / trail     → desde_cero_3d → gradúa a nuevo_montana_3d
```
Ambos arrancan con el mismo run-walk progresivo (bloques A→D, 8 semanas, gate criteria). La diferencia está en a qué plan gradúa cuando alcanza correr 30 min continuos.

#### Pantalla 2b — Sub-pregunta (sólo si elige "Planes avanzados")
```
PLANES AVANZADOS · by Sarah · campeona del mundo

[Unidades: KM | MI]   ← toggle, default KM

¿Tu próxima distancia?

  10K          21K           42K
  10 sem       10 sem        16 sem
  trail        half          marathon

  50mi         100K          (—)
  16 sem       16 sem        próximamente
  ultra        ultra+
```

**5 planes confirmados** (importados desde el PDF de Sarah McCormack / inov-8 el 2026-05-18, archivo `discovery/pro-plans/sarah-mccormack-plans.md`):

| ID | Plan | Semanas | Días/sem | Adaptable | Prereq |
|---|---|---|---|---|---|
| `trail-10k` | Trail 10K | 10 | 6 | 4-5 días | 4 días corriendo/sem |
| `trail-half` | Trail Half Marathon (21K) | 10 | 6 | 5 días | 5-6 días corriendo, 30-40 mi/sem |
| `trail-marathon` | Trail Marathon (42K) | 16 | 6 | 5 días | 5-6 días corriendo, 30-40 mi/sem |
| `50-mile-beginner` | 50 Mile Beginner | 16 | 5 | 4-6 días | Trail half completado |
| `100k` | 100K Ultramarathon | 16 | 6 | 5 días | 2+ ultras completados, 70-80 km/sem |

**Plan eliminado**: `50-mile-improver` (venía incompleto en el PDF original — Vie/Sáb/Dom sin definir).

**Atribución visual**: micro-header "by Sarah · campeona del mundo" arriba del título de la pantalla. SIN mención de apellido ni de inov-8 (ver decisión "muy cauta" más arriba).

**Toggle de unidades** (sólo visible en la pista Avanzados): default KM. Permite cambiar a MI. La app es bilingüe ES/EN; en EN el toggle viene default en MI. Pensado para que el plan 50 Mile (originalmente nombrado en millas) sea legible para el público EEUU que es target de la landing Avanzados exclusiva.

**Diferencia con el resto del onboarding**: las 4 preguntas siguientes (días, sensación, esfuerzo) se mantienen pero los planes Avanzados usan su **propia escala de esfuerzo** ("race pace" 1h/1.5h/2h/3h/4h/easy en vez del RPE 1-5 del coach FlowRun). La pantalla P5 (Cómo medís esfuerzo) puede mostrar copy distinto si la pista elegida es Avanzados.

#### Mapeo pista → plan asignado

| Pista | Sub-elección | Plan asignado |
|---|---|---|
| Empezar de cero | Calle | `desde_cero_3d` → `nuevo_calle_3d` |
| Empezar de cero | Montaña | `desde_cero_3d` → `nuevo_montana_3d` |
| De la calle a la montaña | — | `calle_trail_base_3d` (12 sem) |
| Mejorar en trail | — | Trail Disfrute (bloques E/F/G, base Z1-Z2 + colinas) |
| Planes avanzados | 10K / 21K / 42K / 50K / 100K | Pendiente (TBD por el equipo) |

### Pantalla 3 — Días disponibles
¿Cuántos días podés entrenar?
- 2
- 3
- 4+

| Días | Modificación |
|------|-------------|
| 2 | Eliminar sesión menos prioritaria |
| 3 | Plan estándar |
| 4+ | Agregar RS adicional o fuerza extra |

### Pantalla 4 — Sensación actual
¿Qué te pasa cuando corrés?
- No corro todavía (sólo aparece si pista = "Empezar de cero")
- Me canso rápido
- Me lesiono fácil
- Corro fuerte siempre
- Me cuesta disfrutar

*(Esto asigna `perceived_base` internamente y modula el tono del coach)*

**Lógica v4**: si pista = "Empezar de cero" + "No corro todavía" → salta Pantalla 5 y usa RPE simplificado 1-3 por defecto.

### Pantalla 5 — Ritmo Real
*(Se salta si pista = "Empezar de cero" + "No corro todavía" — usa RPE simplificado automáticamente)*

¿Cómo querés medir tu esfuerzo?
- 💬 Conversación (recomendado)
- 📊 RPE (1–5)
- ⌚ Tengo zona 2 en mi reloj

Si elige HR → ingresa rango manual o estimado (220-edad como fallback)

**Distinción Z1/Z2 para usuarios con reloj:**
Si elige ⌚, mostrar:
- "Tu Z1 es donde podés respirar por la nariz. Tu Z2 es donde hablás en frases completas."
- Internamente, asignar umbrales: Z1 = <70% FCmax, Z2 = 70-80% FCmax (ajustable)

### Pantalla 6 — Generando plan
"Estamos armando tu plan…"
*(Animación breve. Por detrás: asignar plan template + generar 4 semanas)*

### Pantalla 7 — Tu plan listo
Mostrar primera semana con sesiones.
Tono: "Tu foco inicial será construir resistencia sostenible sin sobrecarga."

### Pantalla 8 — Estimación antes/después

Mostrar visualmente qué puede lograr el usuario con Ritmo Real vs sin plan:

```
📊 Tu estimación personalizada

Sin plan:
  Zona roja el 42% del tiempo
  Mayor riesgo de lesión y fatiga

Con Ritmo Real (4 semanas):
  Zona roja solo el 10%
  Más resistencia, menos esfuerzo percibido

[Barra visual: rojo grande → rojo chico, verde chico → verde grande]
```

- Los números se ajustan según perfil (cero → no mostrar %, usar lenguaje cualitativo: "Hoy te cansás rápido → En 4 semanas vas a poder correr 30 min sin parar")
- Para base/avanzado → usar datos de zona roja / RPE estimado
- Imagen de fondo: gráfico simple y limpio, no dashboard complejo

### Pantalla 9 — Tipos de sesión

Antes de soltar al usuario, explicar los tipos de sesión que va a ver en su plan.
Lenguaje simple, sin jerga. Una línea por tipo.

```
🏃 Tus tipos de sesión

Rodaje Sostenible
  "El propósito es que tu cuerpo se recupere y se fortalezca."

Progresivo
  "Empezás suave y terminás un poco más rápido. Tu cuerpo aprende a cambiar de ritmo."

Fuerza / Complementario
  "Ejercicios cortos para que tus piernas aguanten más y te lesiones menos."

[Empezar mi plan →]
```

- Para nivel cero: mostrar solo "Caminata + Trote" y "Fuerza suave"
- Para trail: agregar "Subida controlada" y "Bajada técnica"
- Opcional: video corto de 15 seg por tipo (como Runna con sus coach videos)

### Pantalla 10 — Entrada a la app (NUEVO v4 · loop diario)

Después del onboarding, el usuario aterriza en el home. Acá aparece, no intrusivo, el **banner de conexión con Strava** (u otra fuente: FIT/GPX/manual).

- "Para darte feedback real necesitamos tus actividades. Conectá Strava en 1 toque."
- [Conectar Strava] [Más tarde]

Strava NO se pide durante el onboarding porque:
1. El usuario todavía no completó ninguna corrida en FlowRun → no hay nada que importar
2. Sumar OAuth en medio del onboarding mata la conversión
3. El primer "completar sesión" es el momento natural para pedirlo

---

## Asignación Interna (Invisible al Usuario)

### Graduación nivel "Empezar de cero" → siguiente plan
Cuando el usuario completa `desde_cero_3d` (30 min continuos, RPE ≤ 5):
- Se muestra pantalla de celebración: "Ya podés correr 30 minutos."
- Gradúa automáticamente al plan elegido en la sub-pregunta P2a:
  - Si eligió Calle → `nuevo_calle_3d`
  - Si eligió Montaña → `nuevo_montana_3d`

(En v3 se le re-preguntaba el objetivo. En v4 la sub-pregunta inicial ya lo capturó.)

---

## Cómo Se Ve Una Sesión (Gamificada)

### Ejemplo card nivel Cero (v2):
```
📅 Día 1 — Empezar a Moverse (Bloque A)

🎯 Objetivo: alternar trote y caminata. Sin presión.

🏃 Estructura:
  5' caminata fácil (calentamiento)
  20' → 1 min trote suave + 4 min caminata (repetir)
  5' caminata suave (vuelta a calma)

💡 Tip: Caminar no es hacer trampa. Es parte del plan.

📊 Tu progreso: Bloque A de 4
   Siguiente bloque cuando: RPE ≤ 4, sin molestias

[Completar sesión ✓]
```

### Ejemplo card nivel Nuevo/Base:
```
📅 Día 1 — Rodaje Sostenible

🎯 Objetivo: correr a un ritmo donde puedas hablar sin esfuerzo

🏃 Estructura:
  10' suave (calentamiento)
  30' Ritmo Real (conversacional, Z1-Z2)
  5' suave (vuelta a calma)

💡 Tip: Si en subida no podés hablar, caminá fuerte.
   Sigue siendo entrenamiento válido.

[Completar sesión ✓]
```

### Al completar → Check-in 15 segundos:

**Nivel Cero (simplificado v2):**
1. ¿Pudiste completar todos los bloques de trote? (sí/casi/no)
2. ¿Cómo te sentiste? (bien/regular/mal) → mapea a RPE 2/3/4
3. ¿Molestia o dolor? (no/sí)

**Nivel Nuevo y superior:**
1. ¿Se sintió disfrutable? (sí/no)
2. RPE (1–5)
3. ¿Podías hablar? (sí/a veces/no)
4. ¿Molestia? (no/sí)

### Feedback inmediato:
"Perfecto: esto construye base y te protege de lesiones. 🟢"

---

## Ejemplo de Mensajes Personalizados por Perfil

### Cero (v2)
"Hoy solo tenés que caminar y trotar un poquito. No hay ritmo correcto ni velocidad. Si completás los minutos, fue un éxito."

### Cero — al avanzar de bloque (v2)
"Tu cuerpo respondió bien las últimas 2 semanas. Ahora trotás un poco más y caminás un poco menos. Mismo principio: sin prisa."

### Cero — al repetir bloque (v2)
"Repetimos este bloque una semana más. No es un paso atrás — es darle a tu cuerpo el tiempo que necesita. Así se previenen lesiones."

### Base frágil
"Hoy tu objetivo es correr a un ritmo donde puedas hablar sin esfuerzo. En tu caso, eso va a sentirse más lento de lo que estás acostumbrado. Confía."

### Transición montaña
"En subidas, olvidate del ritmo. Tu indicador es la respiración. Si podés hablar, estás construyendo base para la montaña."

### Base sólida que corre fuerte
"Sabemos que podés más rápido. Pero hoy el objetivo es que tu cuerpo trabaje eficiente, no duro. La velocidad viene después."
