import { emit, toEmitted, naiveDeepClone } from '../util'

/*
 * drag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseleave or end
 */

export default function drag (options = {}) {
  options = {
    minDistance: 5, // TODO: research
    ...options,
  }

  const {
    onDown,
    onMove,
    onOut,
    onUp,
    minDistance,
  } = options

  function mousedown (event, handlerApi) {
    const { setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    setMetadata({ path: 'times.start', value: event.timeStamp })
    setMetadata({ path: 'times.end', value: event.timestamp })

    const point = {
      x: event.clientX,
      y: event.clientY,
    }

    setMetadata({ path: 'points.start', value: point })
    setMetadata({ path: 'points.end', value: point })

    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (event, handlerApi) {
    const { getMetadata, toPolarCoordinates, setMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      const { x: previousX, y: previousY } = getMetadata().points.end,
            { x: startX, y: startY } = getMetadata().points.start,
            { clientX: newX, clientY: newY } = event,
            { distance: distanceFromPrevious, angle: angleFromPrevious } = toPolarCoordinates({
              xA: previousX,
              xB: newX,
              yA: previousY,
              yB: newY,
            }),
            { distance: distanceFromStart, angle: angleFromStart } = toPolarCoordinates({
              xA: startX,
              xB: newX,
              yA: startY,
              yB: newY,
            })

      setMetadata({ path: 'distance.fromPrevious', value: distanceFromPrevious })
      setMetadata({ path: 'angle.fromPrevious', value: angleFromPrevious })
      setMetadata({ path: 'distance.fromStart', value: distanceFromStart })
      setMetadata({ path: 'angle.fromStart', value: angleFromStart })
      
      const previousEndTime = getMetadata().times.end,
            newEndTime = event.timeStamp,
            newEndPoint = { x: newX, y: newY },
            velocity = distanceFromPrevious / (newEndTime - previousEndTime)

      setMetadata({ path: 'points.end', value: newEndPoint })
      setMetadata({ path: 'times.end', value: newEndTime })
      setMetadata({ path: 'velocity', value: velocity })

      recognize(handlerApi)

      emit(onMove, toEmitted(handlerApi))
    } else {
      denied()
    }
  }

  function recognize ({ getMetadata, recognized }) {
    if (getMetadata().distance.fromStart > minDistance) {
      recognized()
    }
  }

  function mouseleave (event, handlerApi) {
    const { getMetadata, denied, setMetadata } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
      emit(onOut, toEmitted(handlerApi))
    }
  }

  function mouseup (event, handlerApi) {
    const { setMetadata, denied } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'up' })
    denied()
    emit(onUp, toEmitted(handlerApi))
  }

  return {
    mousedown,
    mousemove,
    mouseleave,
    mouseup,
  }
}
