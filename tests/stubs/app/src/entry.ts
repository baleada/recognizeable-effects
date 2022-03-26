import * as effects from '../../../../src'
import type {
  ClicksTypes,
  ClicksMetadata,
  ClicksOptions,
  ClicksHook,
  ClicksHookApi,
  MousedragTypes,
  MousedragMetadata,
  MousedragOptions,
  MousedragHook,
  MousedragHookApi,
  MousedragdropTypes,
  MousedragdropMetadata,
  MousedragdropOptions,
  MousedragdropHook,
  MousedragdropHookApi,
  TouchesTypes,
  TouchesMetadata,
  TouchesOptions,
  TouchesHook,
  TouchesHookApi,
  TouchdragTypes,
  TouchdragMetadata,
  TouchdragOptions,
  TouchdragHook,
  TouchdragHookApi,
  TouchdragdropTypes,
  TouchdragdropMetadata,
  TouchdragdropOptions,
  TouchdragdropHook,
  TouchdragdropHookApi,
  KeychordTypes,
  KeychordMetadata,
  KeychordOptions,
  KeychordHook,
  KeychordHookApi,
  KonamiTypes,
  KonamiMetadata,
  KonamiOptions,
  KonamiHook,
  KonamiHookApi
} from '../../../../src'
import { Listenable, Recognizeable } from '@baleada/logic'
import { WithGlobals } from '../../../fixtures/types';

(window as unknown as WithGlobals).effects = effects;
(window as unknown as WithGlobals).Recognizeable = Recognizeable;
(window as unknown as WithGlobals).Listenable = Listenable;
(window as unknown as WithGlobals);

const listenable = new (window as unknown as WithGlobals).Listenable<MousedragTypes, MousedragMetadata>(
  'recognizeable' as MousedragTypes, 
  {
    recognizeable: {
      effects: (window as unknown as WithGlobals).effects.mousedrag()
    }
  }
);

(window as unknown as WithGlobals).testState = {
  listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
}
