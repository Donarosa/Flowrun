// Estilo "con vector" canónico de FlowRun, basado en banner-empezar
// (paleta olivo cálida + montañas + sendero switchback + glifo zigzag).
// Reutilizable: editás CONTENT y corrés. Salida 1080×1350.
// Run: cd instagram && node render-placa-vector.mjs

import puppeteer from 'puppeteer-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = '/tmp/flowrun-vector-v2.png'
const W = 1080, H = 1350

// ── editá esto por placa ──────────────────────────────
const CONTENT = {
  eyebrow: 'Mejorar en trail',
  // usá <em>…</em> para resaltar en serif itálica verde
  headline: 'Menos zona roja.<br>Más <em>kilómetros</em>.<br>Más <em>montaña</em>.',
  handle: '@flowrun20',
  site: 'flowrun.fun',
}
// ──────────────────────────────────────────────────────

const SCENE = `
<svg class="scene" viewBox="0 0 1080 640" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
  <path d="M0,300 L170,250 L330,308 L520,205 L700,292 L880,224 L1080,286 L1080,640 L0,640 Z" fill="#7A9E6B" fill-opacity="0.22"/>
  <path d="M0,430 L240,338 L470,418 L690,300 L905,394 L1080,344 L1080,640 L0,640 Z" fill="#3A4A2D"/>
  <path d="M0,566 L165,505 L325,548 L460,476 L575,250 L705,470 L865,524 L1080,492 L1080,640 L0,640 Z" fill="#2C3A22"/>
  <path d="M 360 632 L 520 588 L 432 548 L 575 506 L 470 464 L 600 422 L 505 384 L 600 344 L 545 312 L 575 270" fill="none" stroke="#F5F2ED" stroke-opacity="0.18" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 360 632 L 520 588 L 432 548 L 575 506 L 470 464 L 600 422 L 505 384 L 600 344 L 545 312 L 575 270" fill="none" stroke="#F5F2ED" stroke-opacity="0.92" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 22"/>
  <circle cx="575" cy="250" r="11" fill="#7A9E6B"/>
  <circle cx="575" cy="250" r="20" fill="none" stroke="#7A9E6B" stroke-opacity="0.45" stroke-width="3"/>
</svg>`

const GLYPH = `<svg viewBox="0 0 100 100" fill="none"><path d="M 14 84 L 72 80 C 88 79 88 63 72 62 L 28 58 C 12 57 12 41 28 40 L 72 36 C 88 35 88 19 72 18 L 42 14" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="14" r="5" fill="currentColor"/></svg>`

const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
:root{--moss:#4A5D3A;--moss-soft:#7A9E6B;--sand:#F5F2ED}
*{box-sizing:border-box;margin:0;padding:0}
.slide{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:var(--moss);color:var(--sand);font-family:'Inter',sans-serif;display:flex;flex-direction:column}
.topo-bg{position:absolute;inset:0;background-image:radial-gradient(ellipse 1500px 500px at 50% -8%,rgba(245,242,237,0.10) 0%,transparent 60%),radial-gradient(ellipse 900px 320px at 18% 8%,rgba(245,242,237,0.06) 0%,transparent 60%);z-index:1}
.watermark{position:absolute;top:64px;left:72px;display:flex;align-items:center;gap:16px;z-index:6}
.wm-symbol{width:56px;height:56px;border-radius:15px;background:rgba(245,242,237,0.16);color:var(--sand);display:flex;align-items:center;justify-content:center}
.wm-symbol svg{width:30px;height:30px}
.wm-text{font-size:27px;font-weight:700;color:var(--sand);letter-spacing:-0.01em}
.content{position:relative;z-index:5;padding:250px 80px 0}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:23px;font-weight:600;color:var(--moss-soft);letter-spacing:.10em;text-transform:uppercase;margin-bottom:34px}
.headline{font-family:'Fraunces',serif;font-weight:400;font-size:112px;line-height:1.0;letter-spacing:-0.035em;color:var(--sand);max-width:920px}
.headline em{font-style:italic;color:var(--moss-soft);font-weight:500}
.scene{position:absolute;left:0;right:0;bottom:0;width:${W}px;height:640px;z-index:2}
.handle{position:absolute;bottom:60px;left:72px;z-index:6;font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:600;color:rgba(245,242,237,0.78);letter-spacing:.02em}
.badge{position:absolute;bottom:58px;right:72px;z-index:6;font-family:'JetBrains Mono',monospace;font-size:19px;font-weight:600;color:var(--sand);letter-spacing:.06em;background:rgba(245,242,237,0.14);padding:12px 22px;border-radius:100px}
</style></head>
<body><div class="slide">
  <div class="topo-bg"></div>
  <div class="watermark"><div class="wm-symbol">${GLYPH}</div><div class="wm-text">flowrun</div></div>
  <div class="content"><div class="eyebrow">${CONTENT.eyebrow}</div><h1 class="headline">${CONTENT.headline}</h1></div>
  ${SCENE}
  <div class="handle">${CONTENT.handle}</div>
  <div class="badge">${CONTENT.site}</div>
</div></body></html>`

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--font-render-hinting=none'] })
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
await page.setContent(html, { waitUntil: 'domcontentloaded' })
await page.evaluate(async () => { await document.fonts.ready })
await new Promise(r => setTimeout(r, 500))
await page.screenshot({ path: OUT })
await browser.close()
console.log('OK →', OUT)
