// Screenshot del mockup del teléfono del hero (landing/index.html) para preview.
// Run: cd instagram && node render-hero-preview.mjs
import puppeteer from 'puppeteer-core'
import path from 'path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const FILE = 'file://' + path.resolve('/Users/macbook/flowrun-deploy/landing/index.html')
const OUT = '/tmp/flowrun-hero-preview.png'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 })
await page.goto(FILE, { waitUntil: 'domcontentloaded' })
await new Promise(r => setTimeout(r, 600)) // dejar correr el i18n
const el = await page.$('.hero-phone')
await el.screenshot({ path: OUT })
await browser.close()
console.log('OK →', OUT)
