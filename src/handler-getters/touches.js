import { toHookApi, naiveDeepClone, lookupToPoint } from '../util'

/*
 * touches is defined as a single touch that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ending less than or equal to 500ms (or a maximum interval of your choice) after the previous tap ended
 */

const defaultOptions = {
  minTaps: 1,
  maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
  maxDistance: 5, // TODO: research appropriate/accessible minDistance
}

export default function touches (options = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minTaps = options.minTaps ?? defaultOptions.minTaps,
        maxInterval = options.maxInterval ?? defaultOptions.maxInterval,
        maxDistance = options.maxDistance ?? defaultOptions.maxDistance

  function touchstart (handlerApi) {
    const { event, setMetadata } = handlerApi
    
    setMetadata({ path: 'touchTotal', value: event.touches.length })
    setMetadata({ path: 'lastTap.times.start', value: event.timeStamp })

    const getPoint = lookupToPoint('touch')
    setMetadata({ path: 'lastTap.points.start', value: getPoint(event) })

    onStart?.(toHookApi(handlerApi))
  }

  function touchmove (handlerApi) {
    onMove?.(toHookApi(handlerApi))
  }

  function touchcancel (handlerApi) {
    const { getMetadata, setMetadata, denied } = handlerApi

    if (getMetadata({ path: 'touchTotal' }) === 1) {
      denied()
      setMetadata({ path: 'touchTotal', value: getMetadata({ path: 'touchTotal' }) - 1 }) // TODO: is there a way to un-cancel a touch without triggering a touch start? If so, this touch total calc would be wrong.
    }

    onCancel?.(toHookApi(handlerApi))
  }

  function touchend (handlerApi) {
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

  function recognize ({ getMetadata, setMetadata, pushMetadata, denied, recognized }) {
    switch (true) {
    case getMetadata({ path: 'lastTap.interval' }) > maxInterval || getMetadata({ path: 'lastTap.distance' }) > maxDistance: // Deny after multiple touches and after taps with intervals or movement distances that are too large
      const lastTap = naiveDeepClone(getMetadata({ path: 'lastTap' }))
      denied()
      setMetadata({ path: 'taps', value: [] })
      pushMetadata({ path: 'taps', value: lastTap })
      break
    default:
      if (getMetadata({ path: 'taps.length' }) >= minTaps) {
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
