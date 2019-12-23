import gestureFactory from '@baleada/gesture'
import { emit, naiveDeepClone } from '../util'

/*
 * taps is defined as a single touch that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not cancel
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each tap ending less than or equal to 500ms (or a maximum interval of your choice) after the previous tap ended
 */

export default function taps (options = {}) {
  options = {
    minTaps: 1,
    maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
    maxDistance: 5, // TODO: research appropriate/accessible minDistance
    ...options,
  }

  const {
    onStart,
    onMove,
    onCancel,
    onEnd,
    minTaps,
    maxInterval,
    maxDistance,
  } = options

  let isSingleTouch, metadata

  function touchstart (event) {
    isSingleTouch = event.touches.length === 1
    metadata.lastTap.times.start = event.timeStamp
    metadata.lastTap.points.start = {
      x: event.touches.item(0).clientX,
      y: event.touches.item(0).clientY
    }

    emit(onStart, naiveDeepClone({ ...object, ...gesture }))
  }
  function touchmove () {
    emit(onMove, naiveDeepClone({ ...object, ...gesture }))
  }
  function touchcancel () {
    gesture.reset()
    emit(onCancel, naiveDeepClone({ ...object, ...gesture }))
  }
  function touchend (event, { toPolarCoordinates }) {
    if (isSingleTouch) {
      const { x: xA, y: yA } = metadata.lastTap.points.start,
            { clientX: xB, clientY: yB } = event.changedTouches.item(0),
            { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = event.timeStamp

      metadata.lastTap.points.end = endPoint
      metadata.lastTap.times.end = endTime
      metadata.lastTap.distance = distance
      metadata.lastTap.interval = metadata.taps.length === 0
        ? 0
        : endTime - metadata.taps[metadata.taps.length - 1].times.end

      const newTap = naiveDeepClone(metadata.lastTap)
      metadata.taps.push(newTap)
    }

    recognize()

    emit(onEnd, naiveDeepClone({ ...object, ...gesture }))
  }
  function recognize () {
    switch (true) {
    case !isSingleTouch || metadata.lastTap.interval > maxInterval || metadata.lastTap.distance > maxDistance: // Reset after multiple touoches and after taps with intervals or movement distances that are too large
      const lastTap = naiveDeepClone(metadata.lastTap)
      gesture.reset()
      metadata.taps.push(lastTap)
      break
    default:
      if (metadata.taps.length >= minTaps) {
        gesture.recognized()
      }
      break
    }
  }
  function onReset () {
    metadata = {
      taps: [],
      lastTap: {
        points: {},
        times: {},
      },
    }
    isSingleTouch = true
  }

  const gesture = gestureFactory({
    onReset,
    handlers: {
      touchstart,
      touchmove,
      touchcancel,
      touchend,
    },
  }),
        object = {
          get metadata () {
            return metadata
          },
          handle: event => gesture.handle(event)
        }

  gesture.reset()

  return object
}
