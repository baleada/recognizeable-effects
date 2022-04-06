import { toHookApi, toCloned, toTouchMovePoint, toPolarCoordinates } from './extracted'
import type { HookApi, PointerStartMetadata } from './extracted'
import type { RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'

/*
 * touches is defined as a single touch that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - does not end before 500ms (or a minimum duration of your choice) has elapsed
 */

export type TouchpressTypes = 'touchstart' | 'touchcancel' | 'touchmove' | 'touchend'

export type TouchpressMetadata = {
  touchTotal: number,
  times: PointerStartMetadata['times'],
  points: PointerStartMetadata['points'],
  distance: number,
  duration: number,
}

export type TouchpressOptions = {
  minDuration?: number,
  maxDistance?: number,
  onStart?: TouchpressHook,
  onMove?: TouchpressHook,
  onCancel?: TouchpressHook,
  onEnd?: TouchpressHook
}

export type TouchpressHook = (api: TouchpressHookApi) => any

export type TouchpressHookApi = HookApi<TouchpressTypes, TouchpressMetadata>

const defaultOptions: TouchpressOptions = {
  minDuration: 500, // Via https://github.com/adobe/react-spectrum/blob/57ceb1ceb0092d523db9d379ce9ff8e60e421a69/packages/%40react-aria/interactions/src/useLongPress.ts#L33-L37
  maxDistance: 5, // TODO: research standard maxDistance
}

const initialMeta = {
  times: {
    start: 0,
    end: 0
  },
  points: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 }
  },
  distance: 0,
}

export function touchpress (options: TouchpressOptions = {}): RecognizeableOptions<TouchpressTypes, TouchpressMetadata>['effects'] {
  const { minDuration, maxDistance, onStart, onMove, onCancel, onEnd } = { ...defaultOptions, ...options },
        cache: { request?: number } = {}

  const touchstart: RecognizeableEffect<'touchstart', TouchpressMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()
    
    metadata.touchTotal = event.touches.length

    if (!metadata.times) {
      metadata.times = toCloned(initialMeta.times)
      metadata.points = toCloned(initialMeta.points)
      metadata.distance = 0
    }
    
    metadata.times.start = event.timeStamp
    metadata.points.start = toTouchMovePoint(event)

    const storeDuration = () => {
      cache.request = requestAnimationFrame(timestamp => {
        if (metadata.touchTotal === 1) {
          metadata.times.end = timestamp
          metadata.duration = timestamp - metadata.times.start
          
          recognize(event, api)
          
          if (api.getStatus() === 'recognizing') storeDuration()
        }
      })
    }

    storeDuration()

    onStart?.(toHookApi(api))
  }

  const touchmove: RecognizeableEffect<'touchmove', TouchpressMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata(),
          { x: xA, y: yA } = metadata.points.start,
          { clientX: xB, clientY: yB } = event.changedTouches.item(0),
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.points.end = endPoint
    metadata.times.end = endTime
    metadata.distance = distance

    onMove?.(toHookApi(api))
  }

  const touchcancel: RecognizeableEffect<'touchcancel', TouchpressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.touchTotal === 1) {
      denied()
      window.cancelAnimationFrame(cache.request)
      metadata.touchTotal = metadata.touchTotal - 1 // TODO: is there a way to un-cancel a touch without triggering a touch start? If so, this touch total calc would be wrong.
    }

    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchpressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    denied()
    window.cancelAnimationFrame(cache.request)
    metadata.touchTotal = metadata.touchTotal - 1

    const { x: xA, y: yA } = metadata.points.start,
          { clientX: xB, clientY: yB } = event.changedTouches.item(0),
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.points.end = endPoint
    metadata.times.end = endTime
    metadata.distance = distance

    onEnd?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchend', TouchpressMetadata> = (event, api) => {
    const { getMetadata, denied, recognized, onRecognized } = api,
          metadata = getMetadata()

    // Deny after multiple touches and after touches with movement distances that are too large
    if (
      metadata.touchTotal > 1
      || metadata.distance > maxDistance
    ) {
      denied()
      window.cancelAnimationFrame(cache.request)
      return
    }

    if (metadata.duration >= minDuration) {
      recognized()
      window.cancelAnimationFrame(cache.request)
      onRecognized(event)
    }
  }
  
  return { touchstart, touchmove, touchcancel, touchend }
}
