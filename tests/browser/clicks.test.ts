import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('clicks (browser)')
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`recognizes clicks`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as any).Listenable(
      'recognizeable', 
      { recognizeable: { handlers: (window as any).recognizeableHandlers.clicks() } }
    );

    (window as any).TEST = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.up()
  
  const value = await page.evaluate(() => (window as any).TEST.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)
})

suite.run()
