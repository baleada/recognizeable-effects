import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('konami (browser)')
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`recognizes Konami code`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as any).Listenable(
      'recognizeable', 
      { recognizeable: { handlers: (window as any).recognizeableHandlers.konami() } }
    );

    (window as any).TEST = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('B')
  await page.keyboard.press('A')
  
  const value = await page.evaluate(() => (window as any).TEST.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)
})


suite.run()
