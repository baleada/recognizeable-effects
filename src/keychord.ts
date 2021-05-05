import { eventMatchesKeycombo, ensureKeycombo, ListenableKeycomboItem } from '@baleada/logic'
import type { RecognizeableHandlerApi } from "@baleada/logic"
import { toHookApi } from './util'
import type { HookApi } from './util'

export type KeychordOptions = {
  maxInterval?: number,
  onDown?: KeychordHook,
  preventsDefaultUnlessDenied?: boolean,
}

export type KeychordHook = (api: KeychordHookApi) => any

export type KeychordHookApi = HookApi<KeyboardEvent>

export type KeychordMetadata = {
  keycombos: KeycomboMetadata[]
}

type KeycomboMetadata = {
  name: string,
  time: number
}

const defaultOptions: KeychordOptions = {
  maxInterval: 5000, // VS Code default
  preventsDefaultUnlessDenied: true,
}

/**
 * @link https://baleada.dev/docs/recognizeable-handlers/keychord
 */
export function keychord (keycombos: string, options: KeychordOptions = {}) {
  const ensuredKeycombos = keycombos.split(' ').map(ensureKeycombo),
        { maxInterval, preventsDefaultUnlessDenied, onDown } = { ...defaultOptions, ...options },
        cache = {
          currentKeycomboIndex: 0,
          lastTimeStamp: 0,
          wasRecognized: false,
        }

  function keydown (handlerApi: RecognizeableHandlerApi<KeyboardEvent>) {
    if (cache.wasRecognized) {
      cleanup(handlerApi)
    }

    const { event, denied, pushMetadata, getStatus } = handlerApi
    
    if (event.timeStamp - cache.lastTimeStamp > maxInterval) {
      cleanup(handlerApi)
    }

    cache.lastTimeStamp = event.timeStamp

    const keycombo = ensuredKeycombos[cache.currentKeycomboIndex]

    if (!eventMatchesKeycombo({ event, keycombo })) {
      denied()
      cleanup(handlerApi)
      onDown?.(toHookApi(handlerApi))
      return
    }

    pushMetadata({
      path: 'keycombos',
      value: {
        time: event.timeStamp,
        name: toName(keycombo)
      }
    })

    recognize(handlerApi)

    if (preventsDefaultUnlessDenied) {
      if (['recognizing', 'recognized'].includes(getStatus())) {
        event.preventDefault()
      }
    }

    onDown?.(toHookApi(handlerApi))
  }

  function recognize (handlerApi: RecognizeableHandlerApi<KeyboardEvent>) {
    const { recognized, getMetadata, } = handlerApi,
          metadata: KeychordMetadata = getMetadata()

    // Wait for more keycombos if necessary.
    if (metadata.keycombos.length < ensuredKeycombos.length) {
      cache.currentKeycomboIndex += 1
      return
    }

    // Max intervals are all fine, and keycombos have been recognized in order.
    // It's recognized!
    recognized()
    cache.wasRecognized = true
  }

  function cleanup (handlerApi: RecognizeableHandlerApi<KeyboardEvent>) {
    handlerApi.setMetadata({ path: 'keycombos', value: [] })
    cache.currentKeycomboIndex = 0
    cache.wasRecognized = false
  }

  return {
    keydown,
  }
}

function toName (keycombo: ListenableKeycomboItem[]) {
  return keycombo.map(({ name }) => name).join('+')
}
