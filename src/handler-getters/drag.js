import { emit, toEmitted, storeStartMetadata, storeMoveMetadata } from '../util'

/*
 * drag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseleave or end
 */

export default function drag (options = {}) {
  options = {
    minDistance: 0,
    ...options,
  }

  const {
    onDown,
    onMove,
    onLeave,
    onUp,
    minDistance,
  } = options

  function mousedown (event, handlerApi) {
    const { setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    storeStartMetadata(event, handlerApi, 'mouse')

    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      storeMoveMetadata(event, handlerApi, 'mouse')
      recognize(handlerApi)
    } else {
      denied()
    }

    emit(onMove, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, recognized }) {
    if (getMetadata().distance.fromStart >= minDistance) {
      recognized()
    }
  }

  function mouseleave (event, handlerApi) {
    const { getMetadata, denied, setMetadata } = handlerApi

    if (getMetadata().mouseStatus === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
    }

    emit(onLeave, toEmitted(handlerApi))
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