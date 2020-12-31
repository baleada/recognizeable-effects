import * as recognizeableHandlers from '/@src/index.js'
import { Listenable, Recognizeable } from '@baleada/logic'

window.recognizeableHandlers = recognizeableHandlers
window.Recognizeable = Recognizeable
window.Listenable = Listenable


const instance = new window.Listenable(
  'recognizeable', 
  { recognizeable: { handlers: window.recognizeableHandlers.clicks() } }
)
instance.listen(() => window.TEST_RESULT = instance.recognizeable.status)
