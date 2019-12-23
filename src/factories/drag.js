import gestureFactory from '@baleada/gesture'
import { emit, naiveDeepClone } from '../util'

/*
 * drag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseout or end
 */

export default function drag (options = {}) {
  options = {
    minDistance: 5, // TODO: research
    ...options,
    recognizesConsecutive: true,
  }

  const {
    onDown,
    onMove,
    onOut,
    onUp,
    minDistance,
  } = options

  let mouseIsDown, metadata

  function mousedown (event) {
    mouseIsDown = true
    metadata.times.start = event.timeStamp
    metadata.points.start = {
      x: event.clientX,
      y: event.clientY,
    }
    emit(onDown, naiveDeepClone({ ...object, ...gesture }))
  }
  function mousemove (event, { toPolarCoordinates }) {
    if (mouseIsDown) {
      const { x: xA, y: yA } = metadata.points.start,
            { clientX: xB, clientY: yB } = event,
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
    } else {
      gesture.reset()
    }
  }
  function recognize () {
    if (metadata.distance > minDistance) {
      gesture.recognized()
    }
  }
  function mouseout () {
    if (mouseIsDown) {
      gesture.reset()
      emit(onOut, naiveDeepClone({ ...object, ...gesture }))
    }
  }
  function mouseup () {
    mouseIsDown = false
    gesture.reset()
    emit(onUp, naiveDeepClone({ ...object, ...gesture }))
  }
  function onReset () {
    metadata = {
      points: {},
      times: {},
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
          handle: event => gesture.handle(event),
        }

  gesture.reset()

  return object
}
