import * as effects from '../../../../src'
import type {
  ClicksTypes,
  ClicksMetadata,
  ClicksOptions,
  ClicksHook,
  ClicksHookApi,
  MousepressTypes,
  MousepressMetadata,
  MousepressOptions,
  MousepressHook,
  MousepressHookApi,
  TouchesTypes,
  TouchesMetadata,
  TouchesOptions,
  TouchesHook,
  TouchesHookApi,
  TouchpressTypes,
  TouchpressMetadata,
  TouchpressOptions,
  TouchpressHook,
  TouchpressHookApi,
  TouchrotateTypes,
  TouchrotateMetadata,
  TouchrotateOptions,
  TouchrotateHook,
  TouchrotateHookApi,
  KeychordTypes,
  KeychordMetadata,
  KeychordOptions,
  KeychordHook,
  KeychordHookApi,
  KeypressTypes,
  KeypressMetadata,
  KeypressOptions,
  KeypressHook,
  KeypressHookApi,
  KonamiTypes,
  KonamiMetadata,
  KonamiOptions,
  KonamiHook,
  KonamiHookApi
} from '../../../../src'
import { Listenable, Recognizeable } from '@baleada/logic'

window.effects = effects;
window.Recognizeable = Recognizeable;
window.Listenable = Listenable;
window;

// const listenable = new window.Listenable<MousepressTypes, MousepressMetadata>(
//   'recognizeable' as MousepressTypes, 
//   {
//     recognizeable: {
//       effects: window.effects.createMousepress({ minDuration: 2000 })
//     }
//   }
// )

// window.testState = {
//   listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
// }

const listenable = new window.Listenable<TouchpressTypes, TouchpressMetadata>(
  'recognizeable' as TouchpressTypes, 
  {
    recognizeable: {
      effects: window.effects.createTouchrelease({
        minDuration: 0,
        onStart: () => startLog.textContent = `${startLogs++}`,
        onEnd: () => endLog.textContent = `${endLogs++}`
      })
    }
  }
)

let startLogs = 0
let endLogs = 0

function getLog () {
  const pre = document.createElement('pre')
  const code = document.createElement('code')
  pre.appendChild(code)
  ;(document.querySelector('main') as HTMLElement).appendChild(pre)

  return code
}

const metadataLog = getLog()
const startLog = getLog()
const endLog = getLog()


window.testState = {
  listenable: listenable.listen(
    () => {
      console.log(listenable.recognizeable.metadata)
      metadataLog.textContent = JSON.stringify(listenable.recognizeable.metadata, null, 2)
    },
    { addEventListener: { passive: false } }
  )
}

// const listenable = new window.Listenable<KeypressTypes, KeypressMetadata>(
//   'recognizeable' as KeypressTypes, 
//   {
//     recognizeable: {
//       effects: window.effects.keypress('space', { minDuration: 2000, effectLimit: false })
//     }
//   }
// )

// window.testState = {
//   listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
// }

// const listenable = new window.Listenable<TouchdragdropTypes, TouchdragdropMetadata>(
//   'recognizeable' as TouchdragdropTypes, 
//   {
//     recognizeable: {
//       effects: window.effects.touchdragdrop()
//     }
//   }
// );

// window.testState = {
//   listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
// }

// const listenable = new window.Listenable<TouchdragTypes, TouchdragMetadata>(
//   'recognizeable' as TouchdragTypes, 
//   {
//     recognizeable: {
//       effects: window.effects.touchdrag()
//     }
//   }
// );

// window.testState = {
//   listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
// }

// const listenable = new window.Listenable<TouchesTypes, TouchesMetadata>(
//   'recognizeable' as TouchesTypes, 
//   {
//     recognizeable: {
//       effects: window.effects.touches()
//     }
//   }
// );

// window.testState = {
//   listenable: listenable.listen(() => console.log(listenable.recognizeable.metadata))
// }
