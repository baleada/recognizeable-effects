import { eventMatchesKeycombo, ensureKeycombo, ListenableKeycomboItem } from '@baleada/logic'
import type { RecognizeableHandlerApi } from "@baleada/logic"
import { toHookApi } from './util'
import type { HookApi } from './util'

/*
 * keychord is defined as at least two keyboard events that meet these conditions:
 * - each key comes back up before the next goes down
 * - excluding the first keydown, each keydown must happen less than or equal to 500ms (or a maximum interval of your choice) after the previous keyup
 */

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
  type: string,
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
          wasRecognized: false,
        }

  function keydown (handlerApi: RecognizeableHandlerApi<KeyboardEvent>) {
    if (cache.wasRecognized) {
      cache.wasRecognized = false
      cleanup(handlerApi)
    }

    const keycombo = ensuredKeycombos[cache.currentKeycomboIndex],
          { event, denied, pushMetadata, getStatus } = handlerApi

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
        type: toType(keycombo)
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
    const {
            getMetadata,
            denied,
            recognized,
          } = handlerApi,
          metadata: KeychordMetadata = getMetadata()

    // Deny if the max interval was exceeded. Not relevant for first keycombo.
    if (cache.currentKeycomboIndex !== 0) {
      const lastKeycombo = metadata.keycombos[metadata.keycombos.length - 1],
            secondToLastKeycombo = metadata.keycombos[metadata.keycombos.length - 2]

      if (lastKeycombo.time - secondToLastKeycombo.time > maxInterval) {
        denied()
        cleanup(handlerApi)
        return
      }
    }

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
    const { setMetadata } = handlerApi
    setMetadata({ path: 'keycombos', value: [] })

    cache.currentKeycomboIndex = 0
  }

  return {
    keydown,
  }
}

function toType (keycombo: ListenableKeycomboItem[]) {
  return keycombo.map(({ name }) => name).join('+')
}
