import { emit, toEmitted, naiveDeepClone, lookupToPoint, isDefined } from '../util'

/*
 * taps is defined as a single touch that:
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

export default function taps (options = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minTaps = isDefined(options.minTaps) ? options.minTaps : defaultOptions.minTaps,
        maxInterval = isDefined(options.maxInterval) ? options.maxInterval : defaultOptions.maxInterval,
        maxDistance = isDefined(options.maxDistance) ? options.maxDistance : defaultOptions.maxDistance

  function touchstart (handlerApi) {
    const { event, setMetadata } = handlerApi
    
    setMetadata({ path: 'touchTotal', value: event.touches.length })
    setMetadata({ path: 'lastTap.times.start', value: event.timeStamp })

    const getPoint = lookupToPoint('touch')
    setMetadata({ path: 'lastTap.points.start', value: getPoint(event) })

    emit(onStart, toEmitted(handlerApi))
  }

  function touchmove (handlerApi) {
    emit(onMove, toEmitted(handlerApi))
  }

  function touchcancel (handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().touchTotal === 1) {
      denied()
      setMetadata({ path: 'touchTotal', value: getMetadata().touchTotal - 1 }) // TODO: is there a way to un-cancel a touch without triggering a touch start? If so, this touch total calc would be wrong.
    }

    emit(onCancel, toEmitted(handlerApi))
  }

  function touchend (handlerApi) {
    const { event, getMetadata, toPolarCoordinates, setMetadata, pushMetadata, denied } = handlerApi

    setMetadata({ path: 'touchTotal', value: getMetadata().touchTotal - 1 })

    if (getMetadata().touchTotal === 0) {
      const { x: xA, y: yA } = getMetadata().lastTap.points.start,
            { clientX: xB, clientY: yB } = event.changedTouches.item(0),
            { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = event.timeStamp

      setMetadata({ path: 'lastTap.points.end', value: endPoint })
      setMetadata({ path: 'lastTap.times.end', value: endTime })
      setMetadata({ path: 'lastTap.distance', value: distance })

      if (!Array.isArray(getMetadata().taps)) {
        setMetadata({ path: 'taps', value: [] })
      }
      const interval = getMetadata().taps.length === 0
        ? 0
        : endTime - getMetadata().taps[getMetadata().taps.length - 1].times.end
      setMetadata({ path: 'lastClick.interval', value: interval })

      const newTap = naiveDeepClone(getMetadata().lastTap)
      pushMetadata({ path: 'taps', value: newTap })

      recognize(handlerApi)
    } else {
      denied()
    }

    emit(onEnd, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, denied, recognized }) {
    switch (true) {
    case getMetadata().lastTap.interval > maxInterval || getMetadata().lastTap.distance > maxDistance: // Deny after multiple touches and after taps with intervals or movement distances that are too large
      const lastTap = naiveDeepClone(getMetadata().lastTap)
      denied()
      setMetadata({ path: 'taps', value: [] })
      pushMetadata({ path: 'taps', value: lastTap })
      break
    default:
      if (getMetadata().taps.length >= minTaps) {
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
