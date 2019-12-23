import gestureFactory from '@baleada/gesture'
import { emit, naiveDeepClone } from '../util'

/*
 * swipe is defined as a single touch that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not cancel
 * - ends
 */
export default function swipe (options = {}) {
  options = {
    minDistance: 10, // TODO: research
    minVelocity: 0.5, // TODO: research
    ...options,
  }

  const {
    onStart,
    onMove,
    onCancel,
    onEnd,
    minDistance,
    minVelocity,
  } = options

  let isSingleTouch, metadata

  function touchstart (event) {
    isSingleTouch = event.touches.length === 1
    metadata.times.start = event.timeStamp
    metadata.points.start = {
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
      const { x: xA, y: yA } = metadata.points.start,
            { clientX: xB, clientY: yB } = event.changedTouches.item(0),
            { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
            endPoint = { x: xB, y: yB },
            endTime = event.timeStamp

      metadata.points.end = endPoint
      metadata.times.end = endTime
      metadata.distance = distance
      metadata.angle = angle
      metadata.velocity = distance / (metadata.times.end - metadata.times.start)
    }

    recognize()

    emit(onEnd, naiveDeepClone({ ...object, ...gesture }))
  }
  function recognize () {
    switch (true) {
    case !isSingleTouch: // Guard against multiple touches
      gesture.reset()
      break
    default:
      if (metadata.distance > minDistance && metadata.velocity > minVelocity) {
        gesture.recognized()
      }
      break
    }
  }
  function onReset () {
    metadata = {
      points: {},
      times: {},
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
