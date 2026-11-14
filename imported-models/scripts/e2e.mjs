import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_BIN,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]
})

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1
})
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push('console: ' + message.text())
})
await page.goto('http://127.0.0.1:4173/', {waitUntil: 'domcontentloaded'})
await page.waitForFunction(() => document.querySelector('#status-text')?.textContent?.includes('Modelo cargado correctamente'), {timeout: 90000})
assert.equal(await page.locator('#model-title').textContent(), 'Casco de vuelo')
await page.screenshot({path: '/tmp/museo-gltf-desktop.png', fullPage: true})
console.log('BROWSER_OK: Casco de vuelo renderizado')

await page.locator('button[data-model="duck-draco"]').click()
await page.waitForFunction(() => document.querySelector('#status-text')?.textContent?.includes('Modelo cargado correctamente'), {timeout: 30000})
assert.equal(await page.locator('#model-title').textContent(), 'Pato Draco')
console.log('BROWSER_OK: Duck Draco cargado')

await page.locator('button[data-model="fox"]').click()
await page.waitForFunction(() => document.querySelector('#status-text')?.textContent?.includes('Modelo cargado correctamente'), {timeout: 30000})
assert.equal(await page.locator('#animation-controls').isVisible(), true)
console.log('BROWSER_OK: Zorro animado con clips disponibles')

await page.locator('#rotate-model').click()
assert.equal(await page.locator('#rotate-model').getAttribute('aria-pressed'), 'false')
await page.locator('#reset-camera').click()
await page.locator('#toggle-grid').click()
assert.equal(await page.locator('#toggle-grid').getAttribute('aria-pressed'), 'false')
console.log('BROWSER_OK: Controles interactivos probados')

await page.setViewportSize({width: 390,height: 844})
await page.screenshot({path:'/tmp/museo-gltf-mobile.png',fullPage:true})
console.log('BROWSER_OK: Vista movil generada')

assert.equal(errors.length, 0, 'Errores de navegador: ' + errors.join(' | '))
await browser.close()
console.log('PRUEBA_WEBGL_EXITOSA')
