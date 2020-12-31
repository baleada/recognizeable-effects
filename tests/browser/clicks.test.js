import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('clicks (browser)')
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`recognizes mousedown/up`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    const instance = new window.Listenable(
      'recognizeable', 
      { recognizeable: { handlers: window.recognizeableHandlers.clicks() } }
    )
    instance.listen(() => window.TEST_RESULT = instance.recognizeable.status)
  })

  await page.mouse.down()
  await page.mouse.up()
  
  const value = await page.evaluate(() => window.TEST_RESULT),
        expected = 'recognized'

  assert.is(value, expected)
})

suite.run()
