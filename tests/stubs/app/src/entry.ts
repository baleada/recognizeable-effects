import * as effects from '../../../../src'
import { Listenable, Recognizeable, Dispatchable } from '@baleada/logic'
import { WithGlobals } from '../../../fixtures/types';

(window as unknown as WithGlobals).effects = effects;
(window as unknown as WithGlobals).Recognizeable = Recognizeable;
(window as unknown as WithGlobals).Listenable = Listenable;
(window as unknown as WithGlobals).Dispatchable = Dispatchable;

// const listenable = new (window as unknown as WithGlobals).Listenable(
//   'recognizeable', 
//   {
//     recognizeable: {
//       effects: (window as unknown as WithGlobals).effects.konami()
//     }
//   }
// );

// (window as unknown as WithGlobals).testState = {
//   listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
// }
