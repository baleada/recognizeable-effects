import { emit, toEmitted, naiveDeepClone } from '../util'

/*
 * dragdrop is defined as a single click that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not mouseleave
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

  function mousedown (event, handlerApi) {
    const { setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    setMetadata({ path: 'times.start', value: event.timeStamp })
    setMetadata({
      path: 'points.start',
      value: {
        x: event.clientX,
        y: event.clientY
      }
    })

    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      emit(onMove, toEmitted(handlerApi))
    } else {
      denied()
    }
  }

  function mouseleave (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
      emit(onOut, toEmitted(handlerApi))
    }
  }

  function mouseup (event, handlerApi) {
    const { setMetadata, getMetadata, toPolarCoordinates } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'up' })

    const { x: xA, y: yA } = getMetadata().points.start, // TODO: less naive start point so that velocity is closer to reality
          { clientX: xB, clientY: yB } = event,
          { distance, angle } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    setMetadata({ path: 'points.end', value: endPoint })
    setMetadata({ path: 'times.end', value: endTime })
    setMetadata({ path: 'distance', value: distance })
    setMetadata({ path: 'angle', value: angle })

    const velocity = distance / (getMetadata().times.end - getMetadata().times.start)
    setMetadata({ path: 'velocity', value: velocity })

    recognize(handlerApi)

    emit(onUp, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, recognized }) {
    if (getMetadata().distance > minDistance && getMetadata().velocity > minVelocity) {
      recognized()
    }
  }

  return {
    mousedown,
    mousemove,
    mouseleave,
    mouseup,
  }
}
