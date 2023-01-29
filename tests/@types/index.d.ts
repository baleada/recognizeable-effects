import * as effects from '../../src'
import { Listenable, Recognizeable } from '@baleada/logic'

type Globals = {
  Listenable: typeof Listenable,
  Recognizeable: typeof Recognizeable,
  effects: typeof effects,
  testState: any,
}

declare global {
  interface Window extends Globals {}
}
