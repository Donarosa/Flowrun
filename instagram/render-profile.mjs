import puppeteer from 'puppeteer-core';
import { readFileSync, mkdirSync } from 'fs';
import path from 'path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SVG = '/Users/macbook/flowrun-deploy/brand/exports_flowrun-lockup-vertical.svg';
const OUT = '/Users/macbook/flowrun-deploy/brand/export';
mkdirSync(OUT, { recursive: true });

const CANVAS = 1080;      // perfil cuadrado 1:1
const LOGO = 600;         // ~56% -> dentro del recorte circular de Instagram
const svg = readFileSync(SVG, 'utf8');

// [nombre, fondo]
const JOBS = [
  ['flowrun-perfil-ig-blanco.jpg', '#FFFFFF'],
  ['flowrun-perfil-ig-arena.jpg',  '#F5F2ED'],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

for (const [outName, bg] of JOBS) {
  const page = await browser.newPage();
  await page.setViewport({ width: CANVAS, height: CANVAS, deviceScaleFactor: 2 });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0}
    .stage{width:${CANVAS}px;height:${CANVAS}px;background:${bg};
      display:flex;align-items:center;justify-content:center}
    .stage svg{width:${LOGO}px;height:${LOGO}px;display:block}
  </style></head><body><div class="stage">${svg}</div></body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT, outName), type: 'jpeg', quality: 95 });
  console.log('✓', outName, `(${CANVAS}x${CANVAS} @2x, fondo ${bg})`);
  await page.close();
}

await browser.close();
console.log('Listo. En:', OUT);
