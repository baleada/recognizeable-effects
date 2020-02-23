import { emit, toEmitted, naiveDeepClone, getGetPoint } from '../util'

/*
 * clicks is defined as a single mouse that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 2 times (or a minimum number of your choice), with each click ending less than or equal to 500ms (or a maximum interval of your choice) after the previous click ended
 */

export default function clicks (options = {}) {
  options = {
    minClicks: 1,
    maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
    maxDistance: 5, // TODO: research standard maxDistance
    ...options,
  }

  const {
    onDown,
    onMove,
    onLeave,
    onUp,
    minClicks,
    maxInterval,
    maxDistance,
  } = options

  function mousedown (event, handlerApi) {
    const { setMetadata } = handlerApi
    
    setMetadata({ path: 'mouseStatus', value: 'down' })
    setMetadata({ path: 'lastClick.times.start', value: event.timeStamp })

    const getPoint = getGetPoint('mouse')
    setMetadata({ path: 'lastClick.points.start', value: getPoint(event) })

    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus !== 'down') {
      denied()
    }

    emit(onMove, toEmitted(handlerApi))
  }

  function mouseleave (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
    }

    emit(onLeave, toEmitted(handlerApi))
  }

  function mouseup (event, handlerApi) {
    const { getMetadata, toPolarCoordinates, setMetadata, pushMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'up' })

    const { x: xA, y: yA } = getMetadata().lastClick.points.start,
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    setMetadata({ path: 'lastClick.points.end', value: endPoint })
    setMetadata({ path: 'lastClick.times.end', value: endTime })
    setMetadata({ path: 'lastClick.distance', value: distance })

    if (!Array.isArray(getMetadata().clicks)) {
      setMetadata({ path: 'clicks', value: [] })
    }
    const interval = getMetadata().clicks.length === 0
      ? 0
      : endTime - getMetadata().clicks[getMetadata().clicks.length - 1].times.end
    setMetadata({ path: 'lastClick.interval', value: interval })

    const newClick = naiveDeepClone(getMetadata().lastClick)
    pushMetadata({ path: 'clicks', value: newClick })

    recognize(handlerApi)

    emit(onUp, toEmitted(handlerApi))
  }
  function recognize ({ getMetadata, denied, setMetadata, pushMetadata, recognized }) {
    switch (true) {
    case getMetadata().lastClick.interval > maxInterval || getMetadata().lastClick.distance > maxDistance: // Deny after multiple touches and after clicks with intervals or movement distances that are too large
      const lastClick = naiveDeepClone(getMetadata().lastClick)
      denied()
      setMetadata({ path: 'clicks', value: [] })
      pushMetadata({ path: 'clicks', value: lastClick })
      break
    default:
      if (getMetadata().clicks.length >= minClicks) {
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
