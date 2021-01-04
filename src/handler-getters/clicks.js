import { emit, toEmitted, naiveDeepClone, lookupToPoint, isDefined } from '../util'

/*
 * clicks is defined as a single mousedown/mouseup combination that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not mouseleave
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each click ending less than or equal to 500ms (or a maximum interval of your choice) after the previous click ended
 */

const defaultOptions = {
  minClicks: 1,
  maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
  maxDistance: 5, // TODO: research standard maxDistance
}

export default function clicks (options = {}) {
  const { minClicks, maxInterval, maxDistance, onDown, onMove, onLeave, onUp } = { ...defaultOptions, ...options }

  function mousedown (handlerApi) {
    const { event, setMetadata } = handlerApi
    
    setMetadata({ path: 'mouseStatus', value: 'down' })
    setMetadata({ path: 'lastClick.times.start', value: event.timeStamp })

    const getPoint = lookupToPoint('mouse')
    setMetadata({ path: 'lastClick.points.start', value: getPoint(event) })

    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata({ path: 'mouseStatus' }) !== 'down') {
      denied()
    }

    emit(onMove, toEmitted(handlerApi))
  }

  function mouseleave (handlerApi) {
    const { getMetadata, setMetadata, denied } = handlerApi

    if (getMetadata({ path: 'mouseStatus' }) === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
    }

    emit(onLeave, toEmitted(handlerApi))
  }

  function mouseup (handlerApi) {
    const { event, getMetadata, toPolarCoordinates, setMetadata, pushMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'up' })

    const { x: xA, y: yA } = getMetadata({ path: 'lastClick.points.start' }),
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    setMetadata({ path: 'lastClick.points.end', value: endPoint })
    setMetadata({ path: 'lastClick.times.end', value: endTime })
    setMetadata({ path: 'lastClick.distance', value: distance })

    if (!Array.isArray(getMetadata({ path: 'clicks' }))) {
      setMetadata({ path: 'clicks', value: [] })
    }
    const interval = getMetadata({ path: 'clicks.length' }) === 0
      ? 0
      : endTime - getMetadata({ path: 'clicks.last.times.end' })
    setMetadata({ path: 'lastClick.interval', value: interval })

    const newClick = naiveDeepClone(getMetadata({ path: 'lastClick' }))
    pushMetadata({ path: 'clicks', value: newClick })

    recognize(handlerApi)

    emit(onUp, toEmitted(handlerApi))
  }
  function recognize ({ getMetadata, denied, setMetadata, pushMetadata, recognized }) {
    switch (true) {
    case getMetadata({ path: 'lastClick.interval' }) > maxInterval || getMetadata({ path: 'lastClick.distance' }) > maxDistance: // Deny after multiple touches and after clicks with intervals or movement distances that are too large
      const lastClick = naiveDeepClone(getMetadata({ path: 'lastClick' }))
      denied()
      setMetadata({ path: 'clicks', value: [] })
      pushMetadata({ path: 'clicks', value: lastClick })
      break
    default:
      if (getMetadata({ path: 'clicks.length' }) >= minClicks) {
        recognized()
      }
      break
    }
  }

  return {
    mousedown,
    mousemove,
    mouseleave,
    mouseup,
  }
}
