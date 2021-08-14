import { eventMatchesKeycombo, ensureKeycombo, ListenableKeycomboItem } from '@baleada/logic'
import type { RecognizeableEffectApi } from "@baleada/logic"
import {
  join as lazyCollectionJoin,
  map as lazyCollectionMap,
  pipe as lazyCollectionPipe,
} from 'lazy-collections'
import { toHookApi } from './extracted'
import type { HookApi } from './extracted'

export type KeychordTypes = 'keydown'

export type KeychordMetadata = {
  keycombos: KeycomboMetadata[]
}

export type KeychordOptions = {
  maxInterval?: number,
  onDown?: KeychordHook,
  preventsDefaultUnlessDenied?: boolean,
}

export type KeychordHook = (api: KeychordHookApi) => any

export type KeychordHookApi = HookApi<KeychordTypes, KeychordMetadata>

type KeycomboMetadata = {
  name: string,
  time: number
}

const defaultOptions: KeychordOptions = {
  maxInterval: 5000, // VS Code default
  preventsDefaultUnlessDenied: true,
}

export function keychord (keycombos: string, options: KeychordOptions = {}) {
  const ensuredKeycombos = keycombos.split(' ').map(ensureKeycombo),
        { maxInterval, preventsDefaultUnlessDenied, onDown } = { ...defaultOptions, ...options },
        cache: {
          currentKeycomboIndex: number,
          lastTimeStamp: number,
          wasRecognized: boolean
        } = {
          currentKeycomboIndex: 0,
          lastTimeStamp: 0,
          wasRecognized: false,
        }

  function keydown (effectApi: RecognizeableEffectApi<'keydown', KeychordMetadata>) {
    if (cache.wasRecognized) {
      cleanup(effectApi)
    }

    const { sequenceItem: event, denied, getStatus } = effectApi
    
    if (cache.lastTimeStamp === 0 || event.timeStamp - cache.lastTimeStamp > maxInterval) {
      cleanup(effectApi)
    }

    cache.lastTimeStamp = event.timeStamp

    const keycombo = ensuredKeycombos[cache.currentKeycomboIndex]

    if (!eventMatchesKeycombo({ event, keycombo })) {
      denied()
      cleanup(effectApi)
      onDown?.(toHookApi(effectApi))
      return
    }

    const { getMetadata } = effectApi,
          metadata = getMetadata()

    metadata.keycombos.push({
      time: event.timeStamp,
      name: toName(keycombo)
    })

    recognize(effectApi)

    if (preventsDefaultUnlessDenied) {
      const status = getStatus()

      if (status === 'recognizing' || status === 'recognized') {
        event.preventDefault()
      }
    }

    onDown?.(toHookApi(effectApi))
  }

  function recognize (effectApi: RecognizeableEffectApi<'keydown', KeychordMetadata>) {
    const { recognized, getMetadata, } = effectApi,
          metadata = getMetadata()

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

  function cleanup (effectApi: RecognizeableEffectApi<'keydown', KeychordMetadata>) {
    const metadata = effectApi.getMetadata()

    metadata.keycombos = []

    cache.currentKeycomboIndex = 0
    cache.wasRecognized = false
  }

  return defineEffect => [
    defineEffect('keydown', keydown),
  ]
}

const toJoinedKeycombo = lazyCollectionPipe(
  lazyCollectionMap(({ name }) => name),
  lazyCollectionJoin('+')
)

function toName (keycombo: ListenableKeycomboItem[]): string {
  return toJoinedKeycombo(keycombo)
}
