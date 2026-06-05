// Genera las placas de Instagram (1080×1350) con la identidad de FlowRun.
// Salida: instagram/placas-5-06/
// Run: cd instagram && node render-placas-5-06.mjs

import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = '/Users/macbook/flowrun-deploy/instagram/placas-5-06'
mkdirSync(OUT, { recursive: true })
const W = 1080, H = 1350

const SWOOSH = `<svg viewBox="0 0 100 100" fill="none" class="swoosh"><path d="M 14 84 L 72 80 C 88 79 88 63 72 62 L 28 58 C 12 57 12 41 28 40 L 72 36 C 88 35 88 19 72 18 L 42 14" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="14" r="5" fill="currentColor"/></svg>`

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
:root{
  --trail:#3D6B3F; --trail-deep:#2B4F2D; --trail-tint:oklch(96% 0.018 145);
  --pine:oklch(26% 0.08 145); --lichen:oklch(94% 0.018 145); --moss:oklch(88% 0.022 145);
  --cream:oklch(98% 0.006 90); --paper:oklch(99.4% 0.004 90); --paper-2:#fff;
  --ink:#1B1F1B; --fg:oklch(24% 0.012 145); --muted:oklch(46% 0.012 145);
  --soft:oklch(70% 0.010 145); --hair:oklch(92% 0.008 90);
  --font:'Inter',sans-serif; --mono:'JetBrains Mono',monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);-webkit-font-smoothing:antialiased}
.frame{width:${W}px;height:${H}px;position:relative;padding:96px 88px 84px;display:flex;flex-direction:column;overflow:hidden}
body.light .frame{background:var(--cream);color:var(--fg)}
body.trial .frame{background:var(--lichen);color:var(--fg)}
body.dark .frame{background:linear-gradient(155deg,var(--pine) 0%,var(--trail-deep) 100%);color:#fff}
body.dark .frame::after{content:'';position:absolute;top:-140px;right:-140px;width:520px;height:520px;background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);border-radius:50%}
/* top bar */
.top{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2}
.brand{display:flex;align-items:center;gap:13px}
.brand .swoosh{width:40px;height:40px;color:var(--trail)}
.brand .wm{font-size:31px;font-weight:700;letter-spacing:-.03em;color:var(--ink);text-transform:lowercase}
.brand .wm .acc{color:var(--trail)}
body.dark .brand .swoosh{color:#fff} body.dark .brand .wm{color:#fff} body.dark .brand .wm .acc{color:var(--moss)}
.idx{font-family:var(--mono);font-size:20px;font-weight:600;letter-spacing:.1em;color:var(--soft)}
body.dark .idx{color:rgba(255,255,255,.55)}
/* content */
.content{flex:1;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}
.content.top{justify-content:flex-start;padding-top:56px}
.kick{font-family:var(--mono);font-size:20px;letter-spacing:.2em;text-transform:uppercase;color:var(--trail);font-weight:600;display:inline-flex;align-items:center;gap:14px;margin-bottom:34px}
.kick::before{content:'';width:34px;height:2px;background:var(--trail);border-radius:1px}
body.dark .kick{color:var(--moss)} body.dark .kick::before{background:var(--moss)}
.title{font-size:76px;font-weight:800;letter-spacing:-.035em;line-height:1.02;color:var(--ink);margin-bottom:30px;text-wrap:balance}
body.dark .title{color:#fff}
.title .acc{color:var(--trail)} body.dark .title .acc{color:var(--moss)}
.title.big{font-size:92px}
.body{font-size:34px;line-height:1.46;color:var(--muted);font-weight:450;max-width:880px}
body.dark .body{color:rgba(255,255,255,.82)}
.body b{color:var(--ink);font-weight:700} body.dark .body b{color:#fff}
/* fuente */
.fuente{position:relative;z-index:2;margin-top:30px;padding-top:24px;border-top:1px solid var(--hair);font-family:var(--mono);font-size:19px;color:var(--muted);letter-spacing:.01em}
.fuente b{color:var(--trail);font-weight:600}
body.dark .fuente{border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.6)}
/* footer */
.foot{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2;font-family:var(--mono);font-size:19px;letter-spacing:.08em;color:var(--soft);text-transform:uppercase}
body.dark .foot{color:rgba(255,255,255,.5)}
.foot .hint{color:var(--trail);font-weight:600} body.dark .foot .hint{color:var(--moss)}
/* steps */
.steps{display:flex;flex-direction:column;gap:0;margin-top:8px}
.step{display:flex;gap:26px;align-items:flex-start;padding:30px 0;border-top:1px solid var(--hair)}
.step .n{flex:none;width:60px;height:60px;border-radius:50%;background:var(--trail);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:24px;font-weight:700}
.step .st{font-size:34px;font-weight:700;color:var(--ink);letter-spacing:-.02em;margin-bottom:7px}
.step .sk{font-family:var(--mono);font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:var(--trail);font-weight:600;margin-bottom:9px}
.step .sd{font-size:24px;line-height:1.4;color:var(--muted)}
/* pista */
.emoji{font-size:104px;line-height:1;margin-bottom:30px}
.chips{display:flex;gap:13px;flex-wrap:wrap;margin-top:38px}
.chip{font-family:var(--mono);font-size:19px;font-weight:600;letter-spacing:.03em;padding:12px 20px;border-radius:999px;background:var(--lichen);color:var(--trail-deep)}
/* trial pill */
.pill{display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:15px 26px;font-family:var(--mono);font-size:18px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--trail);margin-bottom:34px;box-shadow:0 10px 30px -14px rgba(20,40,20,.4)}
.pill .dot{width:9px;height:9px;border-radius:50%;background:var(--trail)}
/* biblio */
.refs{list-style:none;counter-reset:r;margin-top:10px}
.refs li{counter-increment:r;position:relative;padding:17px 0 17px 48px;border-bottom:1px solid rgba(255,255,255,.13);font-family:var(--mono);font-size:19.5px;line-height:1.4;color:rgba(255,255,255,.78)}
.refs li:last-child{border-bottom:none}
.refs li::before{content:counter(r,decimal-leading-zero);position:absolute;left:0;top:19px;font-family:var(--mono);font-size:16px;color:var(--moss);font-weight:700}
.refs li em{color:#fff;font-style:italic;font-weight:500}
`

function pageHTML(theme, inner) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body class="${theme}"><div class="frame">${inner}</div></body></html>`
}
const brand = `<div class="brand">${SWOOSH}<span class="wm">flow<span class="acc">run</span></span></div>`
function top(idx) { return `<div class="top">${brand}${idx ? `<span class="idx">${idx}</span>` : ''}</div>` }
function foot(left, hint) { return `<div class="foot"><span>${left || 'flowrun.fun'}</span>${hint ? `<span class="hint">${hint}</span>` : ''}</div>` }

// ---- slide builders ----
function cover({ kick, title, body, idx }) {
  return pageHTML('dark', top(idx) +
    `<div class="content"><div class="kick">${kick}</div><div class="title big">${title}</div><div class="body">${body}</div></div>` +
    foot('flowrun.fun', 'Deslizá →'))
}
function bodySlide({ theme = 'light', kick, title, body, fuente, idx, hint }) {
  return pageHTML(theme, top(idx) +
    `<div class="content"><div class="kick">${kick}</div><div class="title">${title}</div><div class="body">${body}</div></div>` +
    (fuente ? `<div class="fuente">Fuente — <b>${fuente}</b></div>` : '') +
    foot('flowrun.fun', hint))
}
function stepsSlide({ kick, title, steps, idx, hint }) {
  const rows = steps.map(s => `<div class="step"><div class="n">${s.n}</div><div><div class="sk">${s.k}</div><div class="st">${s.t}</div><div class="sd">${s.d}</div></div></div>`).join('')
  return pageHTML('light', top(idx) +
    `<div class="content"><div class="kick">${kick}</div><div class="title">${title}</div><div class="steps">${rows}</div></div>` +
    foot('flowrun.fun', hint))
}
function pistaSlide({ emoji, kick, title, body, chips, idx }) {
  const c = chips.map(x => `<span class="chip">${x}</span>`).join('')
  return pageHTML('light', top(idx) +
    `<div class="content"><div class="emoji">${emoji}</div><div class="kick">${kick}</div><div class="title">${title}</div><div class="body">${body}</div><div class="chips">${c}</div></div>` +
    foot('flowrun.fun', 'app.flowrun.fun'))
}
function trialSlide({ pill, title, body }) {
  return pageHTML('trial', top('') +
    `<div class="content"><div class="pill"><span class="dot"></span>${pill}</div><div class="title">${title}</div><div class="body">${body}</div></div>` +
    foot('flowrun.fun', 'Empezá gratis →'))
}
function biblioSlide({ refs, idx }) {
  const items = refs.map(r => `<li>${r}</li>`).join('')
  return pageHTML('dark', top(idx) +
    `<div class="content top"><div class="kick">Sin humo</div><div class="title">Bibliografía</div><ol class="refs">${items}</ol></div>` +
    foot('flowrun.fun', ''))
}

// ---- content ----
const SLIDES = [
  // CARRUSEL CIENCIA (8)
  ['ciencia-01-portada', cover({ idx: '01/08', kick: 'Ciencia · Carrusel', title: 'La ciencia<br>detrás de <span class="acc">FlowRun</span>', body: 'No inventamos un método nuevo. Tomamos 40 años de fisiología del ejercicio y lo hicimos usable para un corredor amateur.' })],
  ['ciencia-02-polarizado', bodySlide({ idx: '02/08', kick: '01 · Polarizado', title: 'Corré fácil de verdad', body: 'El error #1 del amateur: los días fáciles muy rápido y los duros muy lento. El modelo polarizado: <b>80% muy suave, 20% fuerte</b>. Sin gris en el medio.', fuente: 'Seiler, S. (2010). Int. J. Sports Physiology' })],
  ['ciencia-03-talktest', bodySlide({ idx: '03/08', kick: '02 · Esfuerzo', title: 'Hablá mientras corrés', body: 'El <b>talk test</b> es el medidor más confiable y barato. ¿Hablás en frases completas? Zona fácil. ¿Palabras sueltas? Zona dura. Sin pulsómetro caro.', fuente: 'Foster, C. et al. (2008). J. Cardiopulm. Rehabil.' })],
  ['ciencia-04-zona2', bodySlide({ idx: '04/08', kick: '03 · Base', title: 'Zona 2: el motor que más cuesta', body: 'Se siente “demasiado lenta”, por eso casi nadie la respeta. Pero es donde el cuerpo aprende a <b>oxidar grasa</b> y construye base aeróbica. La medimos y la protegemos.', fuente: 'San-Millán & Brooks (2017). Sports Medicine' })],
  ['ciencia-05-periodizacion', bodySlide({ idx: '05/08', kick: '04 · Periodización', title: 'Carga y descarga', body: 'No mejorás entrenando duro todos los días: mejorás <b>alternando carga y recuperación</b>. Bloques de 3-4 semanas + una semana de descarga (−20% volumen).', fuente: 'Bompa & Buzzichelli (2018). Periodization' })],
  ['ciencia-06-adaptacion', bodySlide({ idx: '06/08', kick: '05 · Adaptación', title: 'El plan se adapta a vos', body: 'Después de cada sesión, un <b>check-in de 20 seg</b>: RPE, respiración, fatiga. El motor ajusta la semana siguiente: volumen ±10-20%, intensidad, o pausa preventiva.', fuente: 'Borg, G. (1998). Perceived Exertion Scales' })],
  ['ciencia-07-fuerza', bodySlide({ idx: '07/08', kick: '06 · Fuerza', title: 'La fuerza te hace durar', body: 'La evidencia es clarísima: los corredores que entrenan fuerza <b>se lesionan menos</b> y mejoran su economía de carrera. No es opcional, es prevención.', fuente: 'Beattie, K. et al. (2017). J. Strength Cond. Res.' })],
  ['ciencia-08-biblio', biblioSlide({ idx: '08/08', refs: [
    'Seiler, S. (2010). <em>Best practice for training intensity distribution.</em> Int. J. Sports Physiology & Performance, 5(3).',
    'Magness, S. (2014). <em>The Science of Running.</em> Origin Press.',
    "Daniels, J. (2014). <em>Daniels' Running Formula</em> (3rd ed). Human Kinetics.",
    'Foster, C. et al. (2008). <em>The Talk Test as a Marker of Exercise Intensity.</em> J. Cardiopulm. Rehabil., 28(1).',
    "Borg, G. (1998). <em>Borg's Perceived Exertion and Pain Scales.</em> Human Kinetics.",
    'Beattie, K. et al. (2017). <em>Strength Training on Distance Runners.</em> J. Strength Cond. Res., 31(1).',
    'Bompa, T. & Buzzichelli, C. (2018). <em>Periodization</em> (6th ed). Human Kinetics.',
    'McCormack, S. — <em>Running Up That Hill</em> & ultradistance trail coaching.',
    'San-Millán, I. & Brooks, G. (2017). <em>Metabolic flexibility & lactate.</em> Sports Medicine, 48(2).',
  ] })],

  // LANDING (4)
  ['landing-01-problema', bodySlide({ kick: '¿Te suena?', title: 'Salís a correr.<br>Pero no sabés cómo.', body: 'La mayoría corre demasiado rápido los días fáciles y demasiado lento los duros. Resultado: <b>lesiones, agotamiento y ganas de dejar</b>.' })],
  ['landing-02-comofunciona', stepsSlide({ kick: 'Cómo funciona', title: 'Datos + sensación + ciencia', steps: [
    { n: '1', k: 'Elegí', t: 'Elegí lo que querés lograr', d: 'La app te asigna el plan correcto a tu objetivo.' },
    { n: '2', k: 'Corré', t: 'Corré + check-in 20 seg', d: 'Decinos cómo te sentiste: RPE, respiración, intención.' },
    { n: '3', k: 'Aprendé', t: 'Recibí tu coaching', d: 'Qué hiciste bien, qué ajustar, qué viene mañana.' },
  ] })],
  ['landing-03-sindispositivos', bodySlide({ kick: 'Sin fricción', title: 'Sin dispositivos obligatorios', body: 'FlowRun está pensado para ayudarte a entrenar mejor, no para exigirte más tecnología. <b>Si tenés reloj, genial. Si no, también funciona.</b>' })],
  ['landing-04-trial', trialSlide({ pill: '15 días gratis · sin tarjeta', title: 'Probá todo 15 días.<br>Después elegís.', body: 'Acceso a toda la app: las <b>4 pistas</b>, los <b>5 planes Avanzados</b>, el motor de adaptación y el feedback del profe.' })],

  // PISTAS (4)
  ['pista-1-cero', pistaSlide({ emoji: '🌱', kick: 'Pista 01 · Para quién es', title: 'Empezar a correr de cero', body: 'Nunca corriste, o hace años que no. De caminar a correr 30 min seguidos en 8 semanas, sin lesionarte. Run-walk progresivo (método Galloway).', chips: ['8 semanas', '3 días/sem', 'Sin presión'] })],
  ['pista-2-calle-montana', pistaSlide({ emoji: '🏞️', kick: 'Pista 02 · Para quién es', title: 'De la calle a la montaña', body: 'Ya corrés en ciudad y querés ir al trail. Te enseñamos a leer terreno, manejar pendiente y meter fuerza para que las bajadas no te destruyan.', chips: ['12 semanas', '3 días/sem', '3 bloques'] })],
  ['pista-3-mejorar-trail', pistaSlide({ emoji: '🏔️', kick: 'Pista 03 · Para quién es', title: 'Mejorar en trail', body: 'Ya corrés en montaña y querés disfrutar más. Base Z1-Z2, colinas controladas, polarizado suave. Menos zona roja, más kilómetros sostenibles.', chips: ['Ciclos abiertos', '3-4 días/sem', 'Adaptativo'] })],
  ['pista-4-avanzados', pistaSlide({ emoji: '🏅', kick: 'Pista 04 · Para quién es', title: 'Planes Avanzados', body: 'Para corredores con base que apuntan a una carrera. Entrená con los planes de <b>Sarah, campeona del mundo de trail</b>. 5 distancias, periodización por carrera.', chips: ['10K a 100K', '10-16 semanas', 'Con base'] })],
]

// ---- render ----
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--font-render-hinting=none'] })
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
for (const [name, html] of SLIDES) {
  await page.setContent(html, { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => { await document.fonts.ready })
  await new Promise(r => setTimeout(r, 350))
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('  ✓', name + '.png')
}
await browser.close()
console.log(`Listo — ${SLIDES.length} placas en ${OUT}`)
