# CAROUSEL-BRAND.md
## El manual de carruseles de FlowRun

> Este archivo destila los patrones reales de los carruseles que ya publicamos. No es teoría. Es cómo se ve, suena y respira un carrusel FlowRun. Si una pieza nueva no cumple esto, no es FlowRun.

**Fuente analizada:** `Instagram/flowrun-post-01-z2-carousel.html`, `Instagram/flowrun-post-trail-invitation.html`, `Instagram/flowrun-value-proposition.html`, `Instagram/content-market-fit.html`.

**Última actualización:** 2026-05-20

---

## 0. Tres reglas no negociables

1. **Formato vertical 4:5 — 1080×1350 px.** Nunca cuadrado, nunca story.
2. **8 slides.** Siempre. Es la longitud que ya validamos. Más de 8 cansa, menos no alcanza para el arco.
3. **Voseo argentino, siempre.** "Corrés", "estás", "te lo agradece". Nunca "tú", nunca "corres". Si suena español neutro, está mal.

---

## 1. Arco narrativo de 8 slides (el esqueleto)

Cada carrusel sigue esta secuencia. Lo que cambia es el contenido, no la estructura.

| # | Rol | Función | Background típico |
|---|-----|---------|-------------------|
| 01 | **HOOK** | Verdad incómoda o invitación emocional. Frena el scroll. | Moss (verde oscuro) |
| 02 | **PROBLEMA / SETUP** | Qué hace mal la mayoría, o qué les están perdiendo. | Sand (blanco arena) |
| 03 | **DEFINICIÓN / INSIGHT** | El concepto central explicado simple. | Sand o Deep |
| 04 | **CIENCIA / DATO** | El número grande con cita académica. | Deep (navy oscuro) |
| 05 | **HERRAMIENTA / MÉTODO** | Cómo aplicarlo sin tecnología (talk test, caminar, etc.) | Sand o Moss-tint |
| 06 | **VALIDACIÓN POSITIVA** | Checklist verde: "sí estás bien si…" | Moss-tint (verde claro) |
| 07 | **VALIDACIÓN NEGATIVA / INCLUSIÓN** | Checklist terracota: "no, si…" o "no necesitás…" | Deep (navy) |
| 08 | **CTA + PRODUCTO** | Frase grande + mockup/recomendación + pill CTA + handle. | Moss (verde oscuro) |

**Variante emocional** (carrusel "El sendero es para todos"): el slide 5 puede ser una frase declarativa grande en serif italic en lugar de una herramienta. Y el 7 puede ser un "puente" diagramático (asfalto → sendero) en lugar de checklist negativa.

**Patrón visual del arco:** el feed alterna oscuro/claro/claro/oscuro/claro/claro-suave/oscuro/oscuro. Genera ritmo cuando se hace swipe.

---

## 2. Paleta exacta (tokens cerrados)

```css
--moss:        #4A5D3A;   /* verde musgo · primario · backgrounds heroicos */
--moss-deep:   #3A4A2D;   /* verde profundo · raras veces */
--moss-soft:   #7A9E6B;   /* verde claro · acentos sobre oscuro, italics */
--moss-tint:   #E8EEE3;   /* verde tinte · background validación positiva */
--deep:        #1B3A4B;   /* azul profundo · backgrounds ciencia/datos */
--deep-soft:   #2D5066;   /* azul medio · raras veces */
--stone:       #8C8578;   /* gris piedra · subtítulos, slide numbers en light */
--sand:        #F5F2ED;   /* blanco arena · NUNCA blanco puro */
--sand-warm:   #ECE6DC;   /* arena cálida · variante background */
--ink:         #2C2C2C;   /* negro suave · cuerpo · NUNCA #000 */
--terracotta:  #C4826D;   /* terracota · alertas, error, "no" */
--terracotta-tint: #F5E4DE; /* terracota tinte · row warn */
--sky:         #A8C4D4;   /* azul cielo · acento de datos (poco uso) */
```

**Reglas de color**
- **Nunca usar negro puro (#000)** ni blanco puro (#FFF). Siempre `--ink` y `--sand`.
- **Sin bordes 1px.** Nunca. La separación se logra por shift tonal (background diferente) o por radius.
- **Terracota = alerta o "no".** Nunca decorativo.
- **Moss-soft solo brilla sobre fondo oscuro** (moss o deep). En claro pierde contraste.
- **Sky se usa muy poco** — reservado para el tercer punto de una stack sensorial (Aire/Tierra/Silencio).

---

## 3. Tipografía

Dos familias principales + una tercera opcional para tono emocional.

### Inter (default — claridad, datos, claims)
```
display headline:   88–128 px · weight 800 · letter-spacing -0.035em a -0.045em · line-height 0.95–1.05
sub headline:       30–42 px · weight 500–600
body:               30–38 px · weight 400–500 · line-height 1.4
small body:         22–26 px · weight 500
```

### JetBrains Mono (datos, citaciones, slide numbers, pills)
```
big-num (slide 4):  280–380 px · weight 700 · letter-spacing -0.04em a -0.05em
data tags:          18–26 px · weight 600 · uppercase, letter-spacing 0.04–0.1em
eyebrow:            22 px · weight 600 · uppercase, letter-spacing 0.08em
slide number:       18 px · weight 600 · letter-spacing 0.08em
citation:           18–20 px · weight 600 · uppercase, letter-spacing 0.04–0.08em
```

### Fraunces (italic — solo para tono emocional / cultura)
Usar solo en carruseles del pilar **Cultura del Ritmo Propio** (no en Ciencia Simple).
```
serif headline:     108–124 px · weight 400–500 · italic accent
serif italic body:  38–42 px · weight 500 · italic
```

**Reglas tipográficas**
- **Una sola familia por slide cuando es posible.** Mezclar Inter+Fraunces solo si la pieza es del pilar emocional.
- **Mono nunca para titulares.** Solo datos, citaciones, badges, navegación.
- **El italic siempre es acento, nunca cuerpo entero.** Pinta 1–3 palabras de cada slide.
- **Letter-spacing siempre negativo en headlines.** -0.025em a -0.045em. Las letras tienen que sentirse apretadas.
- **Nunca uppercase en titulares.** Solo en eyebrow, citations, labels, slide numbers.

---

## 4. Voz y copywriting — fórmulas que sí funcionan

### Hook (slide 01) — patrones validados

**Patrón "Si X, no Y."** (Ciencia Simple)
> "Si corrés siempre al 80%, *no progresás.*"

**Patrón "Hay un lugar donde…"** (Cultura del Ritmo Propio)
> "Hay un lugar donde correr *deja de doler.*"

**Patrón "La trampa del…"** (Problema)
> "La trampa del 'voy bien'."

**Reglas del hook**
- Máximo 8 palabras visibles a tamaño display.
- Última palabra (o frase de 2 palabras) en italic + moss-soft. Es el "punch".
- Quiebres de línea forzados con `<br>` para controlar el ritmo de lectura.
- Sub-headline de máximo 14 palabras en moss-soft o stone semi-transparente.

### Slide 2–3 (problema / definición)

- Empieza con eyebrow mono uppercase: `01 · el problema`, `02 · la zona 2`.
- Body en pregunta directa o afirmación: `"¿Qué es la zona 2?"`, `"La trampa del 'voy bien'."`
- Usa comparación de 2 columnas (`comp-card`) cuando hay un "demasiado X vs. demasiado Y".
- Cierra con `takeaway` (caja deep) en 1 frase corta: `"Resultado: cansancio sin progreso."`

### Slide 4 (ciencia)

- Background siempre **deep navy**.
- Número GIGANTE en mono (280–380px). Si es ratio, el slash en moss-soft: `80/20`.
- Frase explicativa abajo, 36px, con UNA palabra clave en moss-soft + bold: `"Es estrategia."`
- Cita en pill o como texto mono al pie, formato:
  > `Stephen Seiler · 2006 · científico noruego`
  > `Hunter et al · 2019 · Frontiers in Psychology`
- Las fuentes siempre son reales (Galloway 2016, Seiler 2006, Gabbett 2016, Fokkema 2019, Hunter 2019). Nunca inventar.

### Slide 5–7 (herramienta / validación)

- **Eyebrow** identifica la sección: `03 · el test sin tecnología`, `04 · señales que vas bien`, `05 · te pasaste si`.
- **Listas** siempre con icon circular (56–64px) + texto. Nunca bullets de viñeta clásicos.
- **Checklist positiva**: `✓` blanco sobre círculo moss. Background `moss-tint`. Texto sobre `white`.
- **Checklist negativa**: `✗` blanco sobre círculo terracotta. Background `deep`. Texto `sand`.
- **Talk test (3 estados)**: good (moss-tint) → warn (terracotta-tint) → bad (deep). Cada row con `test-zone` en mono a la derecha: Z2 / Z3 / Z4.

### Slide 8 (CTA)

Estructura fija:
1. **Headline grande** (104–108px) con cierre italic + moss-soft: `"Aprendé a leer tu ritmo real."` / `"Tu primera salida en montaña te está esperando."`
2. **Sub** explicativa, máximo 22 palabras, en sand 75% opacidad.
3. **Card sand** (`app-mockup` o `invitation-card`) con un dato concreto del producto:
   - Mockup style: label mono + número grande mono + zone pill. Ej: `"Tu ritmo real · esta semana"` → `5'52/km` → `Z2 · 78% del volumen`.
   - Invitation style: label mono `"Plan recomendado · 8 semanas"` → nombre del plan → desc → pills (`3 días/sem`, `Z1-Z2`, `Sin reloj`, `Adaptativo`).
4. **CTA row**: pill `"Probá gratis →"` o `"Empezá gratis →"` a la izquierda, `@flowrun.app` en mono a la derecha.

### Reglas de voz

- **Voseo siempre.** Verbos: corrés, estás, podés, terminás, sentís, necesitás.
- **Segunda persona directa.** Le hablamos al runner, no de los runners.
- **Frases cortas.** Si una frase tiene más de 14 palabras, partila.
- **Sin emojis fitness.** Cero fueguitos, cero músculos, cero medallas.
- **Sin hype motivacional.** Nunca "vamos!", "rompé!", "dale!". Nunca exclamación de gimnasio.
- **Anti-comparación.** Nunca "más rápido que ayer", "supéralo". Sí "a tu paso", "tu cuerpo", "tu ritmo".
- **Ciencia humanizada.** "Lo que la mayoría hace mal" antes que "el 67% comete este error".
- **Italic = un beat emocional.** Como una pausa en el habla. Una sola palabra o frase corta por slide.

---

## 5. Componentes reusables (con sus tokens)

### Watermark (esquina superior izquierda · siempre presente)
- Posición: `top: 60px; left: 60px`
- Símbolo `switchback` 44×44px, radius 12px, fill moss (en claro) o rgba(sand, 0.18) (en oscuro).
- Texto "flowrun" 22px Inter weight 700 letter-spacing -0.01em.

### Slide number (esquina inferior izquierda · siempre presente)
- Mono 18px weight 600, formato `01 / 08`, letter-spacing 0.08em.
- Color: stone en claro, rgba(sand, 0.5) en oscuro.

### Swipe cue (solo slide 01)
- "desliza →" en mono 18px, esquina inferior derecha, rgba(sand, 0.6).

### Eyebrow tag
```
font-family: JetBrains Mono;
font-size: 22px;
font-weight: 600;
letter-spacing: 0.08em;
text-transform: uppercase;
color: moss (en claro) | moss-soft (en oscuro) | terracotta (en validación negativa);
margin-bottom: 24px;
```
Formato: `"01 · el problema"`, `"03 · el test sin tecnología"`. Número + bullet + descripción minúscula.

### Data tag (pill mono)
```
background: moss | rgba(sand,0.1);
color: sand;
padding: 20px 32px;
border-radius: 100px;  /* pill completa */
font-family: JetBrains Mono;
font-size: 26px;
font-weight: 600;
letter-spacing: 0.02em;
```
Ej: `RPE 3-4 · 65-75% FC máx`, `Z2 · 78% del volumen`.

### Card sand (para mockups y recomendaciones)
```
background: sand;
border-radius: 32px;
padding: 40px 36px;
```
Contiene: label mono uppercase + dato grande mono + pill zone o pills de plan.

### Comparison card (2 columnas)
```
background: white;
border-radius: 24px;
padding: 36px 32px;
```
Estructura: label mono uppercase moss → value 38px deep weight 700 → error text 24px terracotta.

### Takeaway box
```
background: deep;
color: sand;
padding: 28px 32px;
border-radius: 24px;
font-size: 30px;
font-weight: 600;
```
Una sola frase. Cierra la idea del slide.

### Citation pill
```
display: inline-flex;
background: rgba(sand, 0.1);
padding: 16px 24px;
border-radius: 100px;
font-family: JetBrains Mono;
font-size: 20px;
color: sand;
letter-spacing: 0.04em;
```

### CTA pill (slide 08)
```
background: sand;
color: moss;
padding: 26px 48px;
border-radius: 100px;
font-size: 30px;
font-weight: 700;
```

### Topo-bg (textura sutil opcional)
Para slides oscuros, agregar 3 radial-gradients de baja opacidad simulando relieve topográfico. Decorativo, nunca dominante.

---

## 6. Geometría y spacing

- **Padding de slide**: 180–200px arriba, 80px laterales, 120px abajo. Las primeras 180px son zona del watermark.
- **Padding hook/CTA (slides 01 y 08)**: 80–100px laterales con `justify-content: center`. El texto respira más.
- **Gap entre items de lista**: 14–20px.
- **Border-radius**: 20–24px en cards normales, 32px en cards "card-sand" del CTA, 100px (pill) en tags y botones.
- **Aspect ratio**: 1080×1350 (4:5). Inmutable.

---

## 7. Iconografía

- **Switchback**: el símbolo curvado de la marca. Solo en watermark y, ocasionalmente, dentro de bridge-side (slide 07 trail-invitation). Stroke 6–8px, round caps.
- **Check/cross**: caracteres unicode `✓` y `✗` en peso 800 dentro de círculos de 56–64px. Nunca SVG custom — los caracteres son más limpios.
- **Sin íconos decorativos.** No usamos Font Awesome, Material Icons, lucide, etc. Solo el switchback y los unicode checks.

---

## 8. Fotografía e imagen (cuando se use)

- Golden hour. Tonos cálidos desaturados. Sin filtros saturados.
- Runners relajados, no en grimace de esfuerzo. Sonriendo o concentrados, nunca sufriendo.
- Sendero, montaña, naturaleza > pista, asfalto, gimnasio.
- Sin gente comparándose, sin grupos compitiendo. Soledad o duplas tranquilas.
- Si no hay foto en standard, dejar la slide sin foto. **Nunca usar stock genérico.**

---

## 9. Tres pilares de contenido (lo que filtra el qué)

Cada carrusel pertenece a UN pilar. Cruces permitidos, dominancia obligatoria.

1. **Ciencia Simple** (autoridad) — Z2, talk test, RPE, threshold, 80/20, ACWR, run-walk Galloway, deload. Tono: claro, didáctico, citas reales.
2. **Cultura del Ritmo Propio** (pertenencia) — anti-comparación, miedo a ir lento, lesiones por ego, historias. Tono: emocional, italic, Fraunces permitido.
3. **El Profe Digital** (producto) — screenshots, decisiones de la app, mockups, behind-the-scenes. Tono: building in public, transparente.

**Mix sugerido por feed de 9 posts: 3/3/3** (uno por pilar, tres veces).
**Mix de formatos en 9 posts: 5 carruseles / 2 reels / 2 singles.**

---

## 10. Lista de chequeo antes de publicar

- [ ] 8 slides exactos, 1080×1350 cada uno
- [ ] Watermark en todas las slides, top-left
- [ ] Slide number en todas las slides, bottom-left, formato `XX / 08`
- [ ] Swipe cue solo en slide 01
- [ ] Hook con última palabra/frase en italic + moss-soft
- [ ] Eyebrow mono uppercase en slides 02-07
- [ ] Slide 04 con dato grande en mono + cita real académica
- [ ] CTA con app mockup o invitation card + pill + handle
- [ ] Voseo en todas las frases con verbos
- [ ] Cero exclamaciones de hype, cero emojis fitness
- [ ] Cero bordes 1px en CSS
- [ ] Cero #000 o #FFF puros
- [ ] Italic = solo acento, nunca párrafo entero
- [ ] Cita académica si hay número grande
- [ ] Una sola idea por slide

---

## 11. Cómo exportar (para Instagram)

1. Abrir el HTML del carrusel en Chrome.
2. Click derecho sobre el slide → **Inspect** / **Inspeccionar**.
3. En DevTools, click derecho en el `<div class="slide slide-XX">` → **Capture node screenshot**.
4. Descarga PNG nativo 1080×1350 px. Subir tal cual a Instagram.

---

**Si dudás, mirá `flowrun-post-01-z2-carousel.html` (Ciencia Simple, full Inter) y `flowrun-post-trail-invitation.html` (Cultura, mix Inter+Fraunces). Ese es el espectro. Todo lo nuevo cae adentro.**
