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
    const listenable = new window.Listenable(
      'recognizeable', 
      { recognizeable: { handlers: window.recognizeableHandlers.clicks() } }
    )

    window.TEST = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.up()
  
  const value = await page.evaluate(() => window.TEST.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)
})

suite.run()
