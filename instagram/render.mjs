import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'export');

// archivos de carrusel reales -> prefijo del nombre de salida
const FILES = {
  'flowrun-post-01-z2-carousel.html': 'zona2',
  'flowrun-post-trail-invitation.html': 'trail-invitation',
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

for (const [file, prefix] of Object.entries(FILES)) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.join(DIR, file)).href, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  const slides = await page.$$('.slide');
  let n = 0;
  for (const slide of slides) {
    n++;
    const name = `${prefix}-${String(n).padStart(2, '0')}.png`;
    await slide.screenshot({ path: path.join(OUT, name) });
    console.log('✓', name);
  }
  console.log(`${file}: ${n} slides exportadas\n`);
  await page.close();
}

await browser.close();
console.log('Listo. Imágenes en:', OUT);
