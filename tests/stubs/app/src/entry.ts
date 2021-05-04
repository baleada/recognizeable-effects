import * as recognizeableHandlers from '../../../../src'
import { Listenable, Recognizeable } from '@baleada/logic'

(window as any).recognizeableHandlers = recognizeableHandlers;
(window as any).Recognizeable = Recognizeable;
(window as any).Listenable = Listenable;

const listenable = new (window as any).Listenable(
  'recognizeable', 
  {
    recognizeable: {
      handlers: (window as any).recognizeableHandlers.konami()
    }
  }
);

(window as any).TEST = {
  listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
}
