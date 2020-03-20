import { emit, toEmitted, storeStartMetadata, storeMoveMetadata } from '../util'

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
    minDistance: 0,
    minVelocity: 0,
    ...options,
  }

  const {
    onDown,
    onMove,
    onLeave,
    onUp,
    minDistance,
    minVelocity,
  } = options

  function mousedown (handlerApi) {
    const { event, setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    storeStartMetadata(event, handlerApi, 'mouse')
    
    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (handlerApi) {
    const { event, getMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      storeMoveMetadata(event, handlerApi, 'mouse')
    } else {
      denied()
    }

    emit(onMove, toEmitted(handlerApi))
  }

  function mouseleave (handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
    }

    emit(onLeave, toEmitted(handlerApi))
  }

  function mouseup (handlerApi) {
    const { event, setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'up' })
    storeMoveMetadata(event, handlerApi, 'mouse')

    recognize(handlerApi)

    emit(onUp, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, recognized, denied }) {
    if (getMetadata().distance.fromStart >= minDistance && getMetadata().velocity >= minVelocity) {
      recognized()
    } else {
      denied()
    }
  }

  return {
    mousedown,
    mousemove,
    mouseleave,
    mouseup,
  }
}
