import * as effects from '../../src'
import { Listenable, Recognizeable, Dispatchable } from '@baleada/logic'

export type WithGlobals = Window & {
  Listenable: typeof Listenable,
  Recognizeable: typeof Recognizeable,
  Dispatchable: typeof Dispatchable,
  effects: typeof effects,
  testState: any,
}
