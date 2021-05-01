import { toHookApi, naiveDeepClone, toTouchMovePoint, toTouchEndPoint } from './util'
import type { HookApi } from './util'
import type { RecognizeableHandlerApi } from '@baleada/logic'

/*
 * touches is defined as a single touch that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ending less than or equal to 500ms (or a maximum interval of your choice) after the previous tap ended
 */

export type TouchesOptions = {
  minTouches?: number,
  maxInterval?: number,
  maxDistance?: number,
  onStart?: TouchesHook,
  onMove?: TouchesHook,
  onCancel?: TouchesHook,
  onEnd?: TouchesHook
}

export type TouchesHook = (api: TouchesHookApi) => any

export type TouchesHookApi = HookApi<TouchEvent>

const defaultOptions = {
  minTouches: 1,
  maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
  maxDistance: 5, // TODO: research appropriate/accessible minDistance
}

export function touches (options: TouchesOptions = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minTouches = options.minTouches ?? defaultOptions.minTouches,
        maxInterval = options.maxInterval ?? defaultOptions.maxInterval,
        maxDistance = options.maxDistance ?? defaultOptions.maxDistance

  function touchstart (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { event, setMetadata } = handlerApi
    
    setMetadata({ path: 'touchTotal', value: event.touches.length })
    setMetadata({ path: 'lastTap.times.start', value: event.timeStamp })

    setMetadata({ path: 'lastTap.points.start', value: toTouchMovePoint(event) })

    onStart?.(toHookApi(handlerApi))
  }

  function touchmove (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    onMove?.(toHookApi(handlerApi))
  }

  function touchcancel (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { getMetadata, setMetadata, denied } = handlerApi

    if (getMetadata({ path: 'touchTotal' }) === 1) {
      denied()
      setMetadata({ path: 'touchTotal', value: getMetadata({ path: 'touchTotal' }) - 1 }) // TODO: is there a way to un-cancel a touch without triggering a touch start? If so, this touch total calc would be wrong.
    }

    onCancel?.(toHookApi(handlerApi))
  }

  function touchend (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { event, getMetadata, toPolarCoordinates, setMetadata, pushMetadata, denied } = handlerApi

    setMetadata({ path: 'touchTotal', value: getMetadata({ path: 'touchTotal' }) - 1 })

    if (getMetadata({ path: 'touchTotal' }) === 0) {
      const { x: xA, y: yA } = getMetadata({ path: 'lastTap.points.start' }),
            { clientX: xB, clientY: yB } = event.changedTouches.item(0),
            { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = event.timeStamp

      setMetadata({ path: 'lastTap.points.end', value: endPoint })
      setMetadata({ path: 'lastTap.times.end', value: endTime })
      setMetadata({ path: 'lastTap.distance', value: distance })

      if (!Array.isArray(getMetadata({ path: 'taps' }))) {
        setMetadata({ path: 'taps', value: [] })
      }
      const interval = getMetadata({ path: 'taps.length' }) === 0
        ? 0
        : endTime - getMetadata({ path: 'taps.last.times.end' })
      setMetadata({ path: 'lastClick.interval', value: interval })

      const newTap = naiveDeepClone(getMetadata({ path: 'lastTap' }))
      pushMetadata({ path: 'taps', value: newTap })

      recognize(handlerApi)
    } else {
      denied()
    }

    onEnd?.(toHookApi(handlerApi))
  }

  function recognize ({ getMetadata, setMetadata, pushMetadata, denied, recognized }: RecognizeableHandlerApi<TouchEvent>) {
    switch (true) {
    case getMetadata({ path: 'lastTap.interval' }) > maxInterval || getMetadata({ path: 'lastTap.distance' }) > maxDistance: // Deny after multiple touches and after taps with intervals or movement distances that are too large
      const lastTap = naiveDeepClone(getMetadata({ path: 'lastTap' }))
      denied()
      setMetadata({ path: 'taps', value: [] })
      pushMetadata({ path: 'taps', value: lastTap })
      break
    default:
      if (getMetadata({ path: 'taps.length' }) >= minTouches) {
        recognized()
      }
      break
    }
  }
  
  return {
    touchstart,
    touchmove,
    touchcancel,
    touchend,
  }
}
