// Motor de render de placas FlowRun (flat + vector). Spec-driven.
// Uso: node render-placa.mjs <spec.json>
// El spec define { outDir, slides[] }. Cada slide:
//   FLAT:   { name, style:"flat", type:"cover|body|steps|pista|biblio|trial", ...campos, idx? }
//   VECTOR: { name, style:"vector", eyebrow, headline (usa <em>…</em>), handle?, site? }
// Salida: PNG 1080×1350 por slide en outDir.

import puppeteer from 'puppeteer-core'
import { mkdirSync, readFileSync } from 'fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const W = 1080, H = 1350
const specPath = process.argv[2]
if (!specPath) { console.error('uso: node render-placa.mjs <spec.json>'); process.exit(1) }
const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const OUT = spec.outDir
mkdirSync(OUT, { recursive: true })

const SWOOSH = `<svg viewBox="0 0 100 100" fill="none"><path d="M 14 84 L 72 80 C 88 79 88 63 72 62 L 28 58 C 12 57 12 41 28 40 L 72 36 C 88 35 88 19 72 18 L 42 14" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="14" r="5" fill="currentColor"/></svg>`
// inner del swoosh (sin atributos; el CSS .mark controla fill/stroke)
const SWOOSH_INNER = `<path d="M 14 84 L 72 80 C 88 79 88 63 72 62 L 28 58 C 12 57 12 41 28 40 L 72 36 C 88 35 88 19 72 18 L 42 14"/><circle cx="42" cy="14" r="5"/>`

/* ───────────────── ESTILO FLAT (crema · Inter · swoosh) ───────────────── */
const FLAT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
:root{--trail:#3D6B3F;--trail-deep:#2B4F2D;--pine:oklch(26% 0.08 145);--lichen:oklch(94% 0.018 145);--moss:oklch(88% 0.022 145);--cream:oklch(98% 0.006 90);--paper-2:#fff;--ink:#1B1F1B;--fg:oklch(24% 0.012 145);--muted:oklch(46% 0.012 145);--soft:oklch(70% 0.010 145);--hair:oklch(92% 0.008 90);--font:'Inter',sans-serif;--mono:'JetBrains Mono',monospace}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);-webkit-font-smoothing:antialiased}
.frame{width:${W}px;height:${H}px;position:relative;padding:96px 88px 84px;display:flex;flex-direction:column;overflow:hidden}
body.light .frame{background:var(--cream);color:var(--fg)}
body.trial .frame{background:var(--lichen);color:var(--fg)}
body.dark .frame{background:linear-gradient(155deg,var(--pine) 0%,var(--trail-deep) 100%);color:#fff}
body.dark .frame::after{content:'';position:absolute;top:-140px;right:-140px;width:520px;height:520px;background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);border-radius:50%}
.top{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2}
.brand{display:flex;align-items:center;gap:13px}
.brand .sw{width:40px;height:40px;color:var(--trail)}
.brand .wm{font-size:31px;font-weight:700;letter-spacing:-.03em;color:var(--ink)}
.brand .wm .acc{color:var(--trail)}
body.dark .brand .sw{color:#fff} body.dark .brand .wm{color:#fff} body.dark .brand .wm .acc{color:var(--moss)}
.idx{font-family:var(--mono);font-size:20px;font-weight:600;letter-spacing:.1em;color:var(--soft)}
body.dark .idx{color:rgba(255,255,255,.55)}
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
.fuente{position:relative;z-index:2;margin-top:30px;padding-top:24px;border-top:1px solid var(--hair);font-family:var(--mono);font-size:19px;color:var(--muted)}
.fuente b{color:var(--trail);font-weight:600}
body.dark .fuente{border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.6)}
.foot{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2;font-family:var(--mono);font-size:19px;letter-spacing:.08em;color:var(--soft);text-transform:uppercase}
body.dark .foot{color:rgba(255,255,255,.5)}
.foot .hint{color:var(--trail);font-weight:600} body.dark .foot .hint{color:var(--moss)}
.steps{display:flex;flex-direction:column;margin-top:8px}
.step{display:flex;gap:26px;align-items:flex-start;padding:30px 0;border-top:1px solid var(--hair)}
.step .n{flex:none;width:60px;height:60px;border-radius:50%;background:var(--trail);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:24px;font-weight:700}
.step .st{font-size:34px;font-weight:700;color:var(--ink);letter-spacing:-.02em;margin-bottom:7px}
.step .sk{font-family:var(--mono);font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:var(--trail);font-weight:600;margin-bottom:9px}
.step .sd{font-size:24px;line-height:1.4;color:var(--muted)}
.emoji{font-size:104px;line-height:1;margin-bottom:30px}
.chips{display:flex;gap:13px;flex-wrap:wrap;margin-top:38px}
.chip{font-family:var(--mono);font-size:19px;font-weight:600;letter-spacing:.03em;padding:12px 20px;border-radius:999px;background:var(--lichen);color:var(--trail-deep)}
.pill{display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:15px 26px;font-family:var(--mono);font-size:18px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--trail);margin-bottom:34px;box-shadow:0 10px 30px -14px rgba(20,40,20,.4)}
.pill .dot{width:9px;height:9px;border-radius:50%;background:var(--trail)}
.refs{list-style:none;counter-reset:r;margin-top:10px}
.refs li{counter-increment:r;position:relative;padding:17px 0 17px 48px;border-bottom:1px solid rgba(255,255,255,.13);font-family:var(--mono);font-size:19.5px;line-height:1.4;color:rgba(255,255,255,.78)}
.refs li:last-child{border-bottom:none}
.refs li::before{content:counter(r,decimal-leading-zero);position:absolute;left:0;top:19px;font-family:var(--mono);font-size:16px;color:var(--moss);font-weight:700}
.refs li em{color:#fff;font-style:italic;font-weight:500}
`
const flatPage = (theme, inner) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${FLAT_CSS}</style></head><body class="${theme}"><div class="frame">${inner}</div></body></html>`
const brand = `<div class="brand"><span class="sw">${SWOOSH}</span><span class="wm">flow<span class="acc">run</span></span></div>`
const top = idx => `<div class="top">${brand}${idx ? `<span class="idx">${idx}</span>` : ''}</div>`
const foot = (l, h) => `<div class="foot"><span>${l || 'flowrun.fun'}</span>${h ? `<span class="hint">${h}</span>` : ''}</div>`

function flatHTML(s) {
  switch (s.type) {
    case 'cover':
      return flatPage('dark', top(s.idx) + `<div class="content"><div class="kick">${s.kick}</div><div class="title big">${s.title}</div><div class="body">${s.body}</div></div>` + foot('flowrun.fun', s.hint || 'Deslizá →'))
    case 'body':
      return flatPage(s.theme || 'light', top(s.idx) + `<div class="content"><div class="kick">${s.kick}</div><div class="title">${s.title}</div><div class="body">${s.body}</div></div>` + (s.fuente ? `<div class="fuente">Fuente — <b>${s.fuente}</b></div>` : '') + foot('flowrun.fun', s.hint))
    case 'steps':
      return flatPage('light', top(s.idx) + `<div class="content"><div class="kick">${s.kick}</div><div class="title">${s.title}</div><div class="steps">${s.steps.map(x => `<div class="step"><div class="n">${x.n}</div><div><div class="sk">${x.k}</div><div class="st">${x.t}</div><div class="sd">${x.d}</div></div></div>`).join('')}</div></div>` + foot('flowrun.fun', s.hint))
    case 'pista':
      return flatPage('light', top(s.idx) + `<div class="content"><div class="emoji">${s.emoji}</div><div class="kick">${s.kick}</div><div class="title">${s.title}</div><div class="body">${s.body}</div><div class="chips">${s.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div></div>` + foot('flowrun.fun', 'app.flowrun.fun'))
    case 'trial':
      return flatPage('trial', top('') + `<div class="content"><div class="pill"><span class="dot"></span>${s.pill}</div><div class="title">${s.title}</div><div class="body">${s.body}</div></div>` + foot('flowrun.fun', 'Empezá gratis →'))
    case 'biblio':
      return flatPage('dark', top(s.idx) + `<div class="content top"><div class="kick">${s.kick || 'Sin humo'}</div><div class="title">${s.title || 'Bibliografía'}</div><ol class="refs">${s.refs.map(r => `<li>${r}</li>`).join('')}</ol></div>` + foot('flowrun.fun', ''))
    default: throw new Error('tipo flat desconocido: ' + s.type)
  }
}

/* ───────────────── ESTILO VECTOR (olivo · Fraunces · montañas) ───────────────── */
const SCENE = `<svg class="scene" viewBox="0 0 1080 640" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet"><path d="M0,300 L170,250 L330,308 L520,205 L700,292 L880,224 L1080,286 L1080,640 L0,640 Z" fill="#7A9E6B" fill-opacity="0.22"/><path d="M0,430 L240,338 L470,418 L690,300 L905,394 L1080,344 L1080,640 L0,640 Z" fill="#3A4A2D"/><path d="M0,566 L165,505 L325,548 L460,476 L575,250 L705,470 L865,524 L1080,492 L1080,640 L0,640 Z" fill="#2C3A22"/><path d="M 360 632 L 520 588 L 432 548 L 575 506 L 470 464 L 600 422 L 505 384 L 600 344 L 545 312 L 575 270" fill="none" stroke="#F5F2ED" stroke-opacity="0.18" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M 360 632 L 520 588 L 432 548 L 575 506 L 470 464 L 600 422 L 505 384 L 600 344 L 545 312 L 575 270" fill="none" stroke="#F5F2ED" stroke-opacity="0.92" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 22"/><circle cx="575" cy="250" r="11" fill="#7A9E6B"/><circle cx="575" cy="250" r="20" fill="none" stroke="#7A9E6B" stroke-opacity="0.45" stroke-width="3"/></svg>`
function vectorHTML(s) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>:root{--moss:#4A5D3A;--moss-soft:#7A9E6B;--sand:#F5F2ED}*{box-sizing:border-box;margin:0;padding:0}
.slide{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:var(--moss);color:var(--sand);font-family:'Inter',sans-serif}
.topo{position:absolute;inset:0;background-image:radial-gradient(ellipse 1500px 500px at 50% -8%,rgba(245,242,237,.10) 0%,transparent 60%),radial-gradient(ellipse 900px 320px at 18% 8%,rgba(245,242,237,.06) 0%,transparent 60%);z-index:1}
.wm{position:absolute;top:64px;left:72px;display:flex;align-items:center;gap:16px;z-index:6}
.wm .sym{width:56px;height:56px;border-radius:15px;background:rgba(245,242,237,.16);color:var(--sand);display:flex;align-items:center;justify-content:center}
.wm .sym svg{width:30px;height:30px}.wm .txt{font-size:27px;font-weight:700;color:var(--sand);letter-spacing:-.01em}
.content{position:relative;z-index:5;padding:250px 80px 0}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:23px;font-weight:600;color:var(--moss-soft);letter-spacing:.10em;text-transform:uppercase;margin-bottom:34px}
.headline{font-family:'Fraunces',serif;font-weight:400;font-size:112px;line-height:1.0;letter-spacing:-.035em;color:var(--sand);max-width:920px}
.headline em{font-style:italic;color:var(--moss-soft);font-weight:500}
.scene{position:absolute;left:0;right:0;bottom:0;width:${W}px;height:640px;z-index:2}
.handle{position:absolute;bottom:60px;left:72px;z-index:6;font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:600;color:rgba(245,242,237,.78)}
.badge{position:absolute;bottom:58px;right:72px;z-index:6;font-family:'JetBrains Mono',monospace;font-size:19px;font-weight:600;color:var(--sand);letter-spacing:.06em;background:rgba(245,242,237,.14);padding:12px 22px;border-radius:100px}
</style></head><body><div class="slide"><div class="topo"></div>
<div class="wm"><div class="sym">${SWOOSH}</div><div class="txt">flowrun</div></div>
<div class="content"><div class="eyebrow">${s.eyebrow}</div><h1 class="headline">${s.headline}</h1></div>
${SCENE}<div class="handle">${s.handle || '@flowrun20'}</div><div class="badge">${s.site || 'flowrun.fun'}</div></div></body></html>`
}

/* ───────────────── ESTILO FOTO (foto de fondo · "hot take") ───────────────── */
function fotoHTML(s) {
  const b64 = readFileSync(s.photo).toString('base64')
  const ext = s.photo.toLowerCase().endsWith('.png') ? 'png' : 'jpeg'
  const bg = `data:image/${ext};base64,${b64}`
  const pos = s.objectPos || '50% 40%'
  const scale = s.scale || 1.0
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--trail:#3D6B3F;--pine:#1c3320;--run:#9ec79a;--font:'Inter',sans-serif;--mono:'JetBrains Mono',monospace}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--font);-webkit-font-smoothing:antialiased}
.post{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:var(--pine)}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};transform:scale(${scale});transform-origin:${pos}}
.scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,22,15,.66) 0%,rgba(12,22,15,.30) 30%,rgba(12,22,15,.36) 55%,rgba(12,22,15,.86) 100%),radial-gradient(120% 80% at 50% 120%,rgba(28,51,32,.6),transparent 60%)}
.mark path{fill:none;stroke:currentColor;stroke-width:7;stroke-linecap:round;stroke-linejoin:round}.mark circle{fill:currentColor}
.lockup{display:flex;align-items:center;gap:18px;color:#fff}
.lockup .wm{font-size:38px;font-weight:600;letter-spacing:-.04em;line-height:1;text-transform:lowercase}.lockup .wm .run{color:var(--run)}
.top{position:absolute;top:64px;left:72px;right:72px;display:flex;align-items:center;justify-content:space-between;color:#fff;z-index:5}
.top .kick{font-family:var(--mono);font-size:19px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.62)}
.headline{position:absolute;left:72px;right:72px;bottom:200px;color:#fff;z-index:5}
.headline .ey{font-family:var(--mono);font-size:23px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--run);margin-bottom:26px}
.headline h1{font-size:96px;font-weight:800;line-height:1.0;letter-spacing:-.035em}
.headline h1 .l1{color:#fff}.headline h1 .l2{color:var(--run)}
.footer{position:absolute;left:72px;right:72px;bottom:88px;display:flex;align-items:center;justify-content:space-between;color:#fff;z-index:5}
.footer .src{font-family:var(--mono);font-size:19px;font-weight:500;letter-spacing:.08em;color:rgba(255,255,255,.62)}.footer .src b{color:#fff;font-weight:600}
</style></head><body>
<div class="post">
  <img class="photo" src="${bg}" alt="">
  <div class="scrim"></div>
  <div class="top"><div class="lockup"><svg class="mark" width="48" height="48" viewBox="0 0 100 100" style="color:#fff">${SWOOSH_INNER}</svg><span class="wm">flow<span class="run">run</span></span></div>${s.kick ? '<span class="kick">'+s.kick+'</span>' : ''}</div>
  <div class="headline">${s.eyebrow ? '<div class="ey">'+s.eyebrow+'</div>' : ''}<h1><span class="l1">${s.line1 || ''}</span>${s.line2 ? '<br><span class="l2">'+s.line2+'</span>' : ''}</h1></div>
  <div class="footer"><span class="src">${s.src || ''}</span><div class="lockup"><svg class="mark" width="34" height="34" viewBox="0 0 100 100" style="color:#fff">${SWOOSH_INNER}</svg></div></div>
</div></body></html>`
}

/* ───────────────── render ───────────────── */
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--font-render-hinting=none'] })
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
for (const s of spec.slides) {
  const html = s.style === 'vector' ? vectorHTML(s) : s.style === 'foto' ? fotoHTML(s) : flatHTML(s)
  await page.setContent(html, { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => { await document.fonts.ready })
  await new Promise(r => setTimeout(r, s.style === 'foto' ? 600 : 350))
  await page.screenshot({ path: `${OUT}/${s.name}.png` })
  console.log('  ✓', s.name + '.png', `(${s.style}${s.type ? '/' + s.type : ''})`)
}
await browser.close()
console.log(`Listo — ${spec.slides.length} placa(s) en ${OUT}`)
