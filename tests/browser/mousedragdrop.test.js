import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('mousedragdrop (browser)')
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`recognizes mousedragdrop`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Listenable(
      'recognizeable', 
      { recognizeable: { handlers: window.recognizeableHandlers.mousedragdrop() } }
    )

    window.TEST = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const value = await page.evaluate(() => window.TEST.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`respects minDistance option`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Listenable(
      'recognizeable', 
      { recognizeable: { handlers: window.recognizeableHandlers.mousedragdrop({ minDistance: 101 }) } }
    )
    
    window.TEST = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const from = await page.evaluate(() => window.TEST.listenable.recognizeable.status)
  assert.is(from, 'denied')
  
  await page.mouse.move(0, 0)
  await page.mouse.down()
  await page.mouse.move(0, 101)
  await page.mouse.up()
  
  const to = await page.evaluate(() => window.TEST.listenable.recognizeable.status)
  assert.is(to, 'recognized')
})

suite.skip(`respects minVelocity option`, async ({ puppeteer: { page } }) => {
  // TODO: can't quite get test to work. Feature was manually tested.
})

suite(`calls hooks`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    window.TEST = {
      hooks: {
        onDown: false,
        onMove: false,
        onUp: false,
      }
    }

    const listenable = new window.Listenable(
      'recognizeable', 
      {
        recognizeable: {
          handlers: window.recognizeableHandlers.mousedragdrop({
            onDown: () => window.TEST.hooks.onDown = true,
            onMove: () => window.TEST.hooks.onMove = true,
            onUp: () => window.TEST.hooks.onUp = true,
          })
        }
      }
    )
    
    listenable.listen(() => {})
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const value = await page.evaluate(() => window.TEST.hooks),
        expected = { onDown: true, onMove: true, onUp: true }
  
  assert.equal(value, expected)
})

suite(`doesn't listen for mousemove before mousedown`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    window.TEST = {
      hooks: {
        onMove: false,
      }
    }

    const listenable = new window.Listenable(
      'recognizeable', 
      {
        recognizeable: {
          handlers: window.recognizeableHandlers.mousedragdrop({
            onMove: () => window.TEST.hooks.onMove = true,
          })
        }
      }
    )
    
    listenable.listen(() => {})
  })

  await page.mouse.move(0, 100)
  
  const value = await page.evaluate(() => window.TEST.hooks),
        expected = { onMove: false }
  
  assert.equal(value, expected)
})

suite(`doesn't listen for mousemove after mouseup`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    window.TEST = {
      hooks: {
        onMove: false,
        onUp: false,
      }
    }

    const listenable = new window.Listenable(
      'recognizeable', 
      {
        recognizeable: {
          handlers: window.recognizeableHandlers.mousedragdrop({
            onMove: () => window.TEST.hooks.onMove = window.TEST.hooks.onUp && true,
            onUp: () => window.TEST.hooks.onUp = true,
          })
        }
      }
    )
    
    listenable.listen(() => {})
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  await page.mouse.move(0, 100)
  
  const value = await page.evaluate(() => window.TEST.hooks),
        expected = { onMove: false, onUp: true }
  
  assert.equal(value, expected)
})

suite.run()
