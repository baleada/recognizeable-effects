import * as recognizeableHandlers from '/@src/index.js'
import { Listenable, Recognizeable } from '@baleada/logic'

window.recognizeableHandlers = recognizeableHandlers
window.Recognizeable = Recognizeable
window.Listenable = Listenable

// const listenable = new window.Listenable(
//   'recognizeable', 
//   { recognizeable: { handlers: window.recognizeableHandlers.mousedragdrop({ onMove: ({ metadata }) => console.log(metadata) }) } }
// )

// window.TEST = { listenable: listenable.listen(() => {}) }
