import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('keychord (browser)')
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`recognizes keychords`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as any).Listenable(
      'recognizeable', 
      { recognizeable: { handlers: (window as any).recognizeableHandlers.keychord('p o o p') } }
    );

    (window as any).TEST = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('P')
  await page.keyboard.press('O')
  await page.keyboard.press('O')
  await page.keyboard.press('P')
  
  const value = await page.evaluate(() => (window as any).TEST.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`starts over from beginning after max interval is exceeded`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as any).Listenable(
      'recognizeable', 
      { recognizeable: { handlers: (window as any).recognizeableHandlers.keychord('p o o p', { maxInterval: 100 }) } }
    );

    (window as any).TEST = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('P')
  await page.keyboard.press('O')
  await page.keyboard.press('O')
  await page.waitForTimeout(500)
  await page.keyboard.press('P')
  
  const value = await page.evaluate(() => (window as any).TEST.listenable.recognizeable.status),
        expected = 'recognizing'

  assert.is(value, expected)
})


suite.run()
