import * as recognizeableHandlers from '/@src/index.js'
import { Listenable, Recognizeable } from '@baleada/logic'

window.recognizeableHandlers = recognizeableHandlers
window.Recognizeable = Recognizeable
window.Listenable = Listenable

// const instance = new window.Listenable(
//   'recognizeable', 
//   { recognizeable: { handlers: window.recognizeableHandlers.mousedrag() } }
// )

// window.TEST = { instance }
// instance.listen(() => {
//   console.log(instance.recognizeable.status)
// })
