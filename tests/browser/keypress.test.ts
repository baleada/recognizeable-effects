import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'
import type {
  KeypressTypes,
  KeypressMetadata,
  KeypressOptions,
  KeypressHook,
  KeypressHookApi
} from '../../src'
import { Listenable } from '@baleada/logic'

const suite = withPlaywright(
  createSuite('keypress')
)

suite(`recognizes keypress`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.keypress('A') } }
    );

    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(10)
  
  const value = await page.evaluate(() => ((window as unknown as WithGlobals).testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite(`respects minDuration option`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.keypress('A', { minDuration: 100 }) } }
    );

    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(50)
  
  const recognizing = await page.evaluate(() => ((window as unknown as WithGlobals).testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status)  
  assert.is(recognizing, 'recognizing')

  await page.waitForTimeout(150)
  const recognized = await page.evaluate(() => ((window as unknown as WithGlobals).testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status)
  assert.is(recognized, 'recognized')

  reloadNext()
})

suite.run()
