import gestureFactory from '@baleada/gesture'
import { emit, naiveDeepClone } from '../util'

/*
 * pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not cancel or end
 */
export default function pan (options = {}) {
  options = {
    minDistance: 5, // TODO: research appropriate/accessible minDistance
    ...options,
  }

  const {
    onStart,
    onMove,
    onCancel,
    onEnd,
    minDistance
  } = options

  let isSingleTouch, metadata

  function touchstart (event) {
    isSingleTouch = event.touches.length === 1
    metadata.times.start = event.timeStamp
    metadata.points.start = {
      x: event.touches.item(0).clientX,
      y: event.touches.item(0).clientY,
    }
    emit(onStart, naiveDeepClone({ ...object, ...gesture }))
  }
  function touchmove (event, { toPolarCoordinates }) {
    const { x: xA, y: yA } = metadata.points.start, // TODO: less naive start point so that velocity is closer to reality
          { clientX: xB, clientY: yB } = event.touches.item(0),
          { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.points.end = endPoint
    metadata.times.end = endTime
    metadata.distance = distance
    metadata.angle = angle
    metadata.velocity = distance / (metadata.times.end - metadata.times.start)

    recognize()

    emit(onMove, naiveDeepClone({ ...object, ...gesture }))
  }
  function recognize () {
    switch (true) {
    case !isSingleTouch: // Guard against multiple touches
      gesture.reset()
      break
    default:
      if (metadata.distance > minDistance) {
        gesture.recognized()
      }
      break
    }
  }
  function touchcancel () {
    gesture.reset()
    emit(onCancel, naiveDeepClone({ ...object, ...gesture }))
  }
  function touchend () {
    gesture.reset()
    emit(onEnd, naiveDeepClone({ ...object, ...gesture }))
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
    recognizesConsecutive: true,
  }),
        object = {
          get metadata () {
            return metadata
          },
          get events () {
            return gesture.events
          },
          get lastEvent () {
            return gesture.lastEvent
          },
          get status () {
            return gesture.status
          },
          handle: event => gesture.handle(event)
        }

  gesture.reset()

  return object
}
