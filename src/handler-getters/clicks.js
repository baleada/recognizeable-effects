
import { emit, toEmitted } from '../util'

/*
 * clicks is defined as a single mouse that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 2 times (or a minimum number of your choice), with each click ending less than or equal to 500ms (or a maximum interval of your choice) after the previous click ended
 */

export default function clicks (options) {
  options = {
    minClicks: 1,
    maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
    maxDistance: 5, // TODO: research standard maxDistance
    ...options,
  }

  const {
    onDown,
    onMove,
    onOut,
    onUp,
    minClicks,
    maxInterval,
    maxDistance,
  } = options

  function mousedown (event, handlerApi) {
    const { setMetadata } = handlerApi
    
    setMetadata('mouseStatus', 'down')
    setMetadata('lastClick.times.start', event.timeStamp)
    setMetadata('lastClick.points.start', {
      x: event.clientX,
      y: event.clientY
    })

    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata('mouseStatus') === 'down') {
      emit(onMove, toEmitted(handlerApi))
    } else {
      denied()
    }
  }

  function mouseout (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata('mouseStatus') === 'down') {
      denied()
      emit(onOut, toEmitted(handlerApi))
    }
  }

  function mouseup (event, handlerApi) {
    const { getMetadata, toPolarCoordinates, setMetadata, pushMetadata } = handlerApi

    setMetadata('mouseStatus', 'up')

    const { x: xA, y: yA } = getMetadata('lastClick.points.start'),
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    setMetadata('lastClick.points.end', endPoint)
    setMetadata('lastClick.times.end', endTime)
    setMetadata('lastClick.distance', distance)

    const interval = getMetadata('clicks').length === 0
      ? 0
      : endTime - getMetadata(`clicks.${getMetadata('clicks').length - 1}.times.end`)

    setMetadata('lastClick.interval', interval)

    const newClick = naiveDeepClone(getMetadata('lastClick'))
    pushMetadata('clicks', newClick)

    recognize(handlerApi)

    emit(onUp, toEmitted(handlerApi))
  }
  function recognize ({ getMetadata, denied, recognized }) {
    switch (true) {
    case getMetadata('lastClick.interval') > maxInterval || getMetadata('lastClick.distance') > maxDistance: // Reset after multiple touches and after clicks with intervals or movement distances that are too large
      const lastClick = naiveDeepClone(getMetadata('lastClick'))
      denied()
      pushMetadata('clicks', lastClick)
      break
    default:
      if (getMetadata('clicks').length >= minClicks) {
        recognized()
      }
      break
    }
  }

  return {
    mousedown,
    mousemove,
    mouseout,
    mouseup,
  }
}
