import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'
import type {
  KonamiTypes,
  KonamiMetadata,
  KonamiOptions,
  KonamiHook,
  KonamiHookApi
} from '../../src'

const suite = withPlaywright(
  createSuite('konami')
)

suite(`recognizes Konami code`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new (window as unknown as WithGlobals).Listenable<KonamiTypes, KonamiMetadata>(
      'recognizeable' as KonamiTypes, 
      { recognizeable: { effects: (window as unknown as WithGlobals).effects.konami() } }
    );

    (window as unknown as WithGlobals).testState = { listenable: listenable.listen(() => {}) }
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
  await page.keyboard.press('Enter')
  
  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})


suite.run()
