import gestureFactory from '@baleada/gesture'
import { emit, naiveDeepClone } from '../util'

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
    onOut,
    onUp,
    minClicks,
    maxInterval,
    maxDistance,
  } = options

  let metadata, mouseIsDown

  function mousedown (event) {
    mouseIsDown = true
    metadata.lastClick.times.start = event.timeStamp
    metadata.lastClick.points.start = {
      x: event.clientX,
      y: event.clientY
    }

    emit(onDown, naiveDeepClone({ ...object, ...gesture }))
  }
  function mousemove () {
    if (mouseIsDown) {
      emit(onMove, naiveDeepClone({ ...object, ...gesture }))
    } else {
      gesture.reset()
    }
  }
  function mouseout () {
    if (mouseIsDown) {
      gesture.reset()
      emit(onOut, naiveDeepClone({ ...object, ...gesture }))
    }
  }
  function mouseup (event, { toPolarCoordinates }) {
    mouseIsDown = false
    const { x: xA, y: yA } = metadata.lastClick.points.start,
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.lastClick.points.end = endPoint
    metadata.lastClick.times.end = endTime
    metadata.lastClick.distance = distance
    metadata.lastClick.interval = metadata.clicks.length === 0
      ? 0
      : endTime - metadata.clicks[metadata.clicks.length - 1].times.end

    const newClick = naiveDeepClone(metadata.lastClick)
    metadata.clicks.push(newClick)

    recognize()

    emit(onUp, naiveDeepClone({ ...object, ...gesture }))
  }
  function recognize () {
    switch (true) {
    case metadata.lastClick.interval > maxInterval || metadata.lastClick.distance > maxDistance: // Reset after multiple touches and after clicks with intervals or movement distances that are too large
      const lastClick = naiveDeepClone(metadata.lastClick)
      gesture.reset()
      metadata.clicks.push(lastClick)
      break
    default:
      if (metadata.clicks.length >= minClicks) {
        gesture.recognized()
      }
      break
    }
  }
  function onReset () {
    metadata = {
      clicks: [],
      lastClick: { points: {}, times: {} }
    }
    mouseIsDown = false
  }

  const gesture = gestureFactory({
    onReset,
    handlers: {
      mousedown,
      mousemove,
      mouseout,
      mouseup,
    }
  }),
        object = {
          get metadata () {
            return metadata
          },
          handle: event => gesture.handle(event),
        }

  gesture.reset()

  return object
}
