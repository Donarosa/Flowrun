// Genera los íconos de la landing (favicon + apple-touch + PWA) a partir del
// ícono de marca brand/exports_flowrun-appicon-1024.svg.
// Salida: landing/ (Vercel los sirve en la raíz del dominio).
//
// Run: cd brand && node render-icons.mjs

import puppeteer from 'puppeteer-core'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ROOT = '/Users/macbook/flowrun-deploy'
const SRC = path.join(ROOT, 'brand/exports_flowrun-appicon-1024.svg')
const OUT = path.join(ROOT, 'landing')
mkdirSync(OUT, { recursive: true })

const svg = readFileSync(SRC, 'utf8')

// favicon.svg: el ícono de marca tal cual (los browsers modernos lo escalan).
writeFileSync(path.join(OUT, 'favicon.svg'), svg)

// PNGs a generar: [archivo, lado en px]
const SIZES = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1'],
})
const page = await browser.newPage()

for (const [file, size] of SIZES) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 })
  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}html,body{width:${size}px;height:${size}px;overflow:hidden}
    svg{display:block;width:${size}px;height:${size}px}
  </style></head><body>${svg}</body></html>`
  await page.setContent(html, { waitUntil: 'domcontentloaded' })
  const el = await page.$('svg')
  await el.screenshot({ path: path.join(OUT, file), omitBackground: false })
  console.log(`  ✓ ${file} (${size}×${size})`)
}

await browser.close()
console.log('Listo.')
