import gestureFactory from '@baleada/gesture'
import { emit, naiveDeepClone } from '../util'

/*
 * dragdrop is defined as a single click that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not mouseout
 * - ends
 */
export default function dragdrop (options = {}) {
  options = {
    minDistance: 10, // TODO: research appropriate/accessible minDistance
    minVelocity: 0.5, // TODO: research appropriate/accessible minVelocity
    ...options,
  }

  const {
    onDown,
    onMove,
    onOut,
    onUp,
    minDistance,
    minVelocity,
  } = options

  let mouseIsDown, metadata

  function mousedown (event) {
    mouseIsDown = true
    metadata.times.start = event.timeStamp
    metadata.points.start = {
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
    const { x: xA, y: yA } = metadata.points.start, // TODO: less naive start point so that velocity is closer to reality
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

    emit(onUp, naiveDeepClone({ ...object, ...gesture }))
  }
  function recognize () {
    if (metadata.distance > minDistance && metadata.velocity > minVelocity) {
      gesture.recognized()
    }
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
    }
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
