import { find, some } from 'lazy-collections'
import type { RecognizeableEffect } from "@baleada/logic"
import { toHookApi, storeKeydownStartMetadata } from './extracted'
import type { HookApi, KeydownStartMetadata } from './extracted'

export type KeypressTypes = 'keydown' | 'keyup'

export type KeypressMetadata = {
  duration: number,
  keyStatus: 'down' | 'up',
  keycombo: string,
} & KeydownStartMetadata

export type KeypressOptions = {
  minDuration?: number,
  effectLimit?: number | false,
  onDown?: KeypressHook,
  onUp?: KeypressHook
}

export type KeypressHook = (api: KeypressHookApi) => any

export type KeypressHookApi = HookApi<KeypressTypes, KeypressMetadata>

const defaultOptions: KeypressOptions = {
  minDuration: 0,
  effectLimit: 1,
}

export function keypress (
  keycombo: string | string[],
  options: KeypressOptions = {}
) {
  const ensuredKeycombos = Array.isArray(keycombo) ? keycombo : [keycombo],
        { minDuration, effectLimit, onDown, onUp } = { ...defaultOptions, ...options },
        cache: {
          request?: number,
          totalEffects?: number
        } = {}

  const keydown: RecognizeableEffect<'keydown', KeypressMetadata> = (event, api) => {
    const { matches, denied } = api

    if (
      !some<typeof ensuredKeycombos[0]>(
        ensuredKeycombo => matches(ensuredKeycombo)
      )(ensuredKeycombos)
    ) {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    const { getMetadata, getStatus } = api,
          metadata = getMetadata()

    metadata.keyStatus = 'down'
    metadata.keycombo = find(matches)(ensuredKeycombos) as string
    if (!metadata.times) {
      storeKeydownStartMetadata(event, api)
      metadata.duration = 0
      cache.totalEffects = 0
    }

    // Block repeated keydown events
    if (effectLimit !== false && cache.totalEffects >= effectLimit) return

    const storeDuration = () => {
      cache.request = requestAnimationFrame(timestamp => {
        if (metadata.keyStatus === 'down') {
          metadata.times.end = timestamp
          metadata.duration = Math.max(0, timestamp - metadata.times.start)
          
          recognize(event, api)
          
          const status = getStatus()
          if (
            (status === 'recognizing' || status === 'recognized')
            && (effectLimit === false || cache.totalEffects < effectLimit)
          ) storeDuration()
        }
      })
    }
    
    storeDuration()

    onDown?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'keydown', KeypressMetadata> = (event, api) => {
    const { getMetadata, recognized, onRecognized } = api,
          metadata = getMetadata()

    if (metadata.duration >= minDuration) {
      recognized()
      onRecognized(event)

      if (effectLimit !== false) {
        cache.totalEffects += 1
      }
    }
  }

  const keyup: RecognizeableEffect<'keyup', KeypressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.keyStatus !== 'down') return
          
    denied()
    window.cancelAnimationFrame(cache.request)
    metadata.keyStatus = 'up'
    
    onUp?.(toHookApi(api))
  }

  return {
    keydown,
    keyup,
  }
}
