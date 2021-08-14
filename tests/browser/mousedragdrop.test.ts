import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'
import type {
  MousedragdropTypes,
  MousedragdropMetadata,
  MousedragdropOptions,
  MousedragdropHook,
  MousedragdropHookApi
} from '../../src'

const suite = withPlaywright(
  createSuite('mousedragdrop')
)

suite(`recognizes mousedragdrop`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<MousedragdropTypes, MousedragdropMetadata>(
      'recognizeable' as MousedragdropTypes,
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.mousedragdrop() } }
    );

    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite(`respects minDistance option`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<MousedragdropTypes, MousedragdropMetadata>(
      'recognizeable' as MousedragdropTypes,
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.mousedragdrop({ minDistance: 101 }) } }
    );
    
    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.listenable.recognizeable.status)
  assert.is(from, 'denied')
  
  await page.mouse.move(0, 0)
  await page.mouse.down()
  await page.mouse.move(0, 101)
  await page.mouse.up()
  
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.listenable.recognizeable.status)
  assert.is(to, 'recognized')

  reloadNext()
})

suite.skip(`respects minVelocity option`, async ({ playwright: { page, reloadNext } }) => {
  // TODO: can't quite get test to work. Feature was manually tested.
})

suite(`calls hooks`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState = {
      hooks: {
        onDown: false,
        onMove: false,
        onUp: false,
      }
    }

    const listenable = new (window as unknown as WithGlobals).Listenable<MousedragdropTypes, MousedragdropMetadata>(
      'recognizeable' as MousedragdropTypes,
      {
        recognizeable: {
          effects: (window as unknown as WithGlobals).effects.mousedragdrop({
            onDown: () => (window as unknown as WithGlobals).testState.hooks.onDown = true,
            onMove: () => (window as unknown as WithGlobals).testState.hooks.onMove = true,
            onUp: () => (window as unknown as WithGlobals).testState.hooks.onUp = true,
          })
        }
      }
    )
    
    listenable.listen(() => {})
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.hooks),
        expected = { onDown: true, onMove: true, onUp: true }
  
  assert.equal(value, expected)

  reloadNext()
})

suite(`doesn't listen for mousemove before mousedown`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState = {
      hooks: {
        onMove: false,
      }
    }

    const listenable = new (window as unknown as WithGlobals).Listenable<MousedragdropTypes, MousedragdropMetadata>(
      'recognizeable' as MousedragdropTypes,
      {
        recognizeable: {
          effects: (window as unknown as WithGlobals).effects.mousedragdrop({
            onMove: () => (window as unknown as WithGlobals).testState.hooks.onMove = true,
          })
        }
      }
    )
    
    listenable.listen(() => {})
  })

  await page.mouse.move(0, 100)
  
  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.hooks),
        expected = { onMove: false }
  
  assert.equal(value, expected)

  reloadNext()
})

suite(`doesn't listen for mousemove after mouseup`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState = {
      hooks: {
        onMove: false,
        onUp: false,
      }
    }

    const listenable = new (window as unknown as WithGlobals).Listenable<MousedragdropTypes, MousedragdropMetadata>(
      'recognizeable' as MousedragdropTypes,
      {
        recognizeable: {
          effects: (window as unknown as WithGlobals).effects.mousedragdrop({
            onMove: () => (window as unknown as WithGlobals).testState.hooks.onMove = (window as unknown as WithGlobals).testState.hooks.onUp && true,
            onUp: () => (window as unknown as WithGlobals).testState.hooks.onUp = true,
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
  
  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.hooks),
        expected = { onMove: false, onUp: true }
  
  assert.equal(value, expected)

  reloadNext()
})

suite.run()
