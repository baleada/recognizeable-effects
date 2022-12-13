import type { RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, storePointerStartMetadata, PointerStartMetadata } from './extracted'
import type { HookApi } from './extracted'

/*
 * mousepress is defined as a single mousedown that:
 * - starts at a given point
 * - does not mouseleave or end before 0ms (or a minimum duration of your choice) has elapsed
 */

export type MousepressTypes = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousepressMetadata = {
  duration: number,
  mouseStatus: 'down' | 'up' | 'leave',
} & PointerStartMetadata

export type MousepressOptions = {
  minDuration?: number,
  effectLimit?: number | false,
  onDown?: MousepressHook,
  onLeave?: MousepressHook,
  onUp?: MousepressHook,
}

export type MousepressHook = (api: MousepressHookApi) => any

export type MousepressHookApi = HookApi<MousepressTypes, MousepressMetadata>

const defaultOptions: MousepressOptions = {
  minDuration: 0,
  effectLimit: 1,
}

export function mousepress (options: MousepressOptions = {}): RecognizeableOptions<MousepressTypes, MousepressMetadata>['effects'] {
  const { minDuration, effectLimit, onDown, onLeave, onUp } = { ...defaultOptions, ...options },
        cache: {
          request?: number,
          totalEffects?: number,
        } = {}

  const mousedown: RecognizeableEffect<'mousedown', MousepressMetadata> = (event, api) => {
    const { getMetadata, getStatus } = api,
          metadata = getMetadata()

    metadata.mouseStatus = 'down'
    storePointerStartMetadata(event, api)
    metadata.duration = 0
    cache.totalEffects = 0

    const storeDuration = () => {
      cache.request = requestAnimationFrame(timestamp => {
        if (metadata.mouseStatus === 'down') {
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

  const recognize: RecognizeableEffect<'mousedown', MousepressMetadata> = (event, api) => {
    const { getMetadata, recognized, onRecognized } = api,
          metadata = getMetadata()

    if (metadata.duration >= minDuration) {
      recognized()
      onRecognized(event)

      if (effectLimit !== false) cache.totalEffects += 1
    }
  }

  const mouseleave: RecognizeableEffect<'mouseleave', MousepressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      window.cancelAnimationFrame(cache.request)
      metadata.mouseStatus = 'leave'
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<'mouseup', MousepressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.mouseStatus !== 'down') return
          
    denied()
    window.cancelAnimationFrame(cache.request)
    metadata.mouseStatus = 'up'
    
    onUp?.(toHookApi(api))
  }

  return {
    mousedown,
    mouseleave,
    mouseup,
  }
}
