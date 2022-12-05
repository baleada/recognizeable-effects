import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'
import type {
  MousepressTypes,
  MousepressMetadata,
  MousepressOptions,
  MousepressHook,
  MousepressHookApi
} from '../../src'
import { Listenable } from '@baleada/logic'

const suite = withPlaywright(
  createSuite('mousepress')
)

suite(`recognizes mousepress`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<MousepressTypes, MousepressMetadata>(
      'recognizeable' as MousepressTypes, 
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.mousepress() } }
    );

    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.waitForTimeout(10)
  
  const value = await page.evaluate(() => ((window as unknown as WithGlobals).testState.listenable as Listenable<MousepressTypes, MousepressMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite(`respects minDuration option`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<MousepressTypes, MousepressMetadata>(
      'recognizeable' as MousepressTypes, 
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.mousepress({ minDuration: 1000 }) } }
    );

    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.waitForTimeout(500)
  
  const recognizing = await page.evaluate(() => ((window as unknown as WithGlobals).testState.listenable as Listenable<MousepressTypes, MousepressMetadata>).recognizeable.status)  
  assert.is(recognizing, 'recognizing')

  await page.waitForTimeout(1000)
  const recognized = await page.evaluate(() => ((window as unknown as WithGlobals).testState.listenable as Listenable<MousepressTypes, MousepressMetadata>).recognizeable.status)
  assert.is(recognized, 'recognized')

  reloadNext()
})

suite.run()
