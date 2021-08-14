import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'
import type {
  TouchesTypes,
  TouchesMetadata,
  TouchesOptions,
  TouchesHook,
  TouchesHookApi
} from '../../src'
import { Listenable } from '@baleada/logic'

const suite = withPlaywright(
  createSuite('touches')
)

suite(`recognizes touches`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<TouchesTypes, TouchesMetadata>(
      'recognizeable' as TouchesTypes, 
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.touches() } }
    );

    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}, { target: document.body }) }

    const touchstart = new (window as unknown as WithGlobals).Dispatchable('touchstart'),
          touchmove = new (window as unknown as WithGlobals).Dispatchable('touchmove'),
          touchcancel = new (window as unknown as WithGlobals).Dispatchable('touchcancel'),
          touchend = new (window as unknown as WithGlobals).Dispatchable('touchend'),
          touch = new Touch({ identifier: 1, target: document.body })

    touchstart.dispatch({ target: document.body, init: { touches: [touch] } })
    touchend.dispatch({ target: document.body, init: { touches: [touch] } })
  })
  
  const value = await page.evaluate(() => ((window as unknown as WithGlobals).testState.listenable as Listenable<TouchesTypes, TouchesMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite.run()
