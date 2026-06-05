import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'export');

const FILE = 'flowrun-banner-empezar.html';
const NAME = 'banner-empezar.png';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(path.join(DIR, FILE)).href, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 700));

const slide = await page.$('.slide');
await slide.screenshot({ path: path.join(OUT, NAME) });
console.log('✓', NAME);

await browser.close();
console.log('Listo. Imagen en:', path.join(OUT, NAME));
