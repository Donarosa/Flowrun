import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import path from 'path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BRAND = '/Users/macbook/flowrun-deploy/brand';
const OUT = '/Users/macbook/flowrun-deploy/brand/export';

// [archivo svg, nombre salida, fondo, ancho del logo en px, ancho lienzo, alto lienzo]
const JOBS = [
  ['exports_flowrun-lockup-horizontal.svg', 'flowrun-logo-blanco.jpg',  '#FFFFFF', 1400, 2000, 800],
  ['exports_flowrun-lockup-horizontal.svg', 'flowrun-logo-arena.jpg',   '#F5F2ED', 1400, 2000, 800],
];

import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

for (const [svgFile, outName, bg, logoW, canvasW, canvasH] of JOBS) {
  const svg = readFileSync(path.join(BRAND, svgFile), 'utf8');
  const page = await browser.newPage();
  await page.setViewport({ width: canvasW, height: canvasH, deviceScaleFactor: 2 });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0}
    .stage{width:${canvasW}px;height:${canvasH}px;background:${bg};
      display:flex;align-items:center;justify-content:center}
    .stage svg{width:${logoW}px;height:auto;display:block}
  </style></head><body><div class="stage">${svg}</div></body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT, outName), type: 'jpeg', quality: 95 });
  console.log('✓', outName, `(${canvasW}x${canvasH} @2x, fondo ${bg})`);
  await page.close();
}

await browser.close();
console.log('Listo. En:', OUT);
