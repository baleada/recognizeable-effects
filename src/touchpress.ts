import type { RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, storePointerStartMetadata, PointerStartMetadata, PointerMoveMetadata } from './extracted'
import type { HookApi } from './extracted'

/*
 * touchpress is defined as a single touch that:
 * - starts at a given point
 * - does not cancel or end before 0ms (or a minimum duration of your choice) has elapsed
 */

export type TouchpressTypes = 'touchstart' | 'touchcancel' | 'touchend'

export type TouchpressMetadata = {
  duration: number,
  touchTotal: number,
} & PointerStartMetadata

export type TouchpressOptions = {
  minDuration?: number,
  effectLimit?: number | false,
  onStart?: TouchpressHook,
  onCancel?: TouchpressHook,
  onEnd?: TouchpressHook,
}

export type TouchpressHook = (api: TouchpressHookApi) => any

export type TouchpressHookApi = HookApi<TouchpressTypes, TouchpressMetadata>

const defaultOptions: TouchpressOptions = {
  minDuration: 0,
  effectLimit: 1,
}

export function touchpress (options: TouchpressOptions = {}): RecognizeableOptions<TouchpressTypes, TouchpressMetadata>['effects'] {
  const { minDuration, effectLimit, onStart, onCancel, onEnd } = { ...defaultOptions, ...options },
        cache: {
          request?: number,
          totalEffects?: number
        } = {}

  const touchstart: RecognizeableEffect<'touchstart', TouchpressMetadata> = (event, api) => {
    const { getMetadata, getStatus, denied } = api,
          metadata = getMetadata()

    metadata.touchTotal = event.touches.length
    storePointerStartMetadata(event, api)
    metadata.duration = 0
    cache.totalEffects = 0

    const storeDuration = () => {
      cache.request = requestAnimationFrame(timestamp => {
        if (metadata.touchTotal === 1) {
          metadata.times.end = timestamp
          metadata.duration = Math.max(0, timestamp - metadata.times.start)
          
          recognize(event, api)
          
          const status = getStatus()
          if (
            (status === 'recognizing' || status === 'recognized')
            && (effectLimit === false || cache.totalEffects < effectLimit)
          ) storeDuration()
        } else {
          denied()
        }
      })
    }
    
    storeDuration()

    onStart?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchstart', TouchpressMetadata> = (event, api) => {
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

  const touchcancel: RecognizeableEffect<'touchcancel', TouchpressMetadata> = (event, api) => {
    const { denied } = api
          
    denied()
    window.cancelAnimationFrame(cache.request)

    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchpressMetadata> = (event, api) => {
    const { denied } = api
          
    denied()
    window.cancelAnimationFrame(cache.request)
    
    onEnd?.(toHookApi(api))
  }

  return {
    touchstart,
    touchcancel,
    touchend,
  }
}
