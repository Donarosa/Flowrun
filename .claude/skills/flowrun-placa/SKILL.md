---
name: flowrun-placa
user_invocable: true
description: >
  Genera placas e imágenes de carrusel para Instagram 100% on-brand de FlowRun (coach AI de trail running, Argentina). Pregunta el tipo de placa, con o sin vector, y el copy; después renderiza PNG reales 1080×1350 con el motor instagram/render-placa.mjs — no descripciones, no prompts de IA. Usar siempre que el usuario diga "placa", "placa flowrun", "hacé una placa", "carrusel flowrun", "generá placas", "contenido para instagram", o invoque /flowrun-placa.
---

# FlowRun · Generador de placas

Genera placas/carruseles de Instagram con la identidad EXACTA de FlowRun, renderizando PNG reales (no descripciones). Reúne todo lo del sistema de contenido: voz, templates y motor de render.

## Reglas de marca (consistencia absoluta)

- **Tamaño:** 1080×1350 (4:5). Siempre.
- **Logo:** el swoosh (la S-curva con punto). NUNCA el glifo zigzag viejo. Wordmark "flowrun" lowercase.
- **Handle:** `@flowrun20` · sitio `flowrun.fun`.
- **Voz:** leé `content/voice.md` y `content/about-me.md` antes de escribir copy. Voseo argentino, concreto, sin humo. Hooks: afirmación incómoda + giro. CTA simple ("Empezá gratis 15 días → link en bio"). Nunca gurú motivacional, nunca promesas garantizadas.
- **En placas de ciencia: SIEMPRE citar la fuente** (campo `fuente`). Bibliografía completa en `landing/ciencia/index.html`.

## Tres estilos (preguntar por placa)

- **Flat:** fondo crema, fuente **Inter**, swoosh. Para contenido informativo (ciencia, producto, datos, listas).
- **Vector (aspiracional):** fondo **olivo `#4A5D3A`**, fuente serif **Fraunces** con itálicas verde sage, montañas + sendero switchback. Para frases inspiracionales, pistas.
- **Foto (hot take):** **foto de fondo** con scrim verde-tintado. Wordmark "flow**run**" (run en `#9ec79a`), eyebrow + frase bold en 2 líneas (blanco + verde `#9ec79a`), kick arriba-derecha, remate abajo. Para hooks/opiniones contrarian sobre una imagen potente. **Requiere que el usuario dé la ruta de una foto.**

## Templates disponibles (campos del spec)

Estilo `flat` (`style:"flat"`), elegí `type`:
- `cover` — portada de carrusel (fondo oscuro). Campos: `kick`, `title`, `body`, `src?` (línea sutil de fuentes abajo), `idx?`.
- `body` — kicker + título + párrafo (+cita opcional). Campos: `kick`, `title`, `body`, `fuente?`, `theme?` ("light"|"trial"|"dark"), `idx?`.
- `steps` — pasos numerados. Campos: `kick`, `title`, `steps:[{n,k,t,d}]`, `idx?`.
- `pista` — emoji + badge + título + desc + chips. Campos: `emoji`, `kick`, `title`, `body`, `chips:[]`, `idx?`.
- `trial` — pill + título + body (verde). Campos: `pill`, `title`, `body`.
- `biblio` — lista de referencias numeradas (fondo oscuro). Campos: `refs:[]`, `title?`, `idx?`.

Estilo `vector` (`style:"vector"`): campos `eyebrow`, `headline` (usá `<em>…</em>` para resaltar 1-2 palabras en serif itálica), `handle?`, `site?`.

Estilo `foto` (`style:"foto"`): campos `photo` (ruta absoluta a la imagen — OBLIGATORIO, pedísela al usuario), `kick` (arriba-der), `eyebrow` (acento), `line1` (blanco), `line2` (verde), `src` (remate abajo, admite `<b>`), `objectPos?` (ej "50% 38%"), `scale?` (ej 1.18, para encuadrar la foto).

> En títulos/headlines podés resaltar con `<span class="acc">palabra</span>` (flat) o `<em>palabra</em>` (vector). Negrita en body con `<b>`. Para carruseles, poné `idx` tipo "01/05".

## Workflow

### Paso 1 — Preguntar (AskUserQuestion)
Hacé las preguntas con la herramienta AskUserQuestion (no como texto). Combiná en 1-2 llamadas:
1. **¿Placa única o carrusel?** (si carrusel, cuántas placas).
2. **¿Qué estilo?** → **flat** (crema/Inter) · **vector** (olivo/serif/montañas) · **foto** (foto de fondo, hot take). En carrusel se puede mezclar.
3. Si **foto**: **pedí la ruta de la foto de fondo** (ruta absoluta al archivo). Si **flat**: preguntá el **tipo** (cover/body/steps/pista/trial/biblio).
4. **Tema / copy** (texto exacto, o un tema para que lo escribas en la voz de marca).

Si el usuario dice "vos decidí" o "tu call", aplicá defaults sensatos y avanzá sin bloquear.

### Paso 2 — Escribir el copy y armar el spec
- Redactá el copy en la voz de `content/voice.md` (voseo, hook fuerte, sin humo). Máx ~40 palabras de body por placa.
- En ciencia, agregá `fuente`.
- Construí un objeto spec JSON:
  ```json
  { "outDir": "/Users/macbook/flowrun-deploy/instagram/placas-<HOY>",
    "slides": [ { "name": "01-...", "style": "...", "type": "...", ... } ] }
  ```
  Usá la fecha de hoy (YYYY-MM-DD) en la carpeta. Nombres de archivo con prefijo numérico.

### Paso 3 — Renderizar
- Escribí el spec a un archivo (ej. `/tmp/placa-spec.json`).
- Corré: `cd instagram && node render-placa.mjs /tmp/placa-spec.json`
- Los PNG quedan en `instagram/placas-<HOY>/`.

### Paso 4 — Entregar
- Confirmá la ruta y listá los archivos. Ofrecé abrir con `!open <carpeta>`.
- Ofrecé escribir los **captions** (en la voz de marca) y/o **commitear** la carpeta.

## Reglas
- Nunca inventes otra paleta, fuente ni logo: usá los de este doc y el motor.
- El motor (`instagram/render-placa.mjs`) es la fuente de verdad del render — no lo edites para una placa puntual; pasale el spec.
- Si falta el copy, escribilo vos en la voz de marca; no devuelvas placeholders.
- 1-2 palabras de resalte por título, no frases enteras.
