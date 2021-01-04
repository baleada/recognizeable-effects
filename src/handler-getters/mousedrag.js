import { emit, toEmitted, storeStartMetadata, storeMoveMetadata, isDefined } from '../util'

/*
 * drag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseleave or end
 */

const defaultOptions = {
  minDistance: 0,
}

export default function drag (options = {}) {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = isDefined(options.minDistance) ? options.minDistance : defaultOptions.minDistance

  function mousedown (handlerApi) {
    const { event, setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    storeStartMetadata(event, handlerApi, 'mouse')

    const { target } = event
    target.addEventListener(mousemove)

    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (handlerApi) {
    const { event, getMetadata, denied } = handlerApi

    if (getMetadata({ path: 'mouseStatus' }) === 'down') {
      storeMoveMetadata(event, handlerApi, 'mouse')
      recognize(handlerApi)
    } else {
      denied()
    }

    emit(onMove, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, recognized }) {
    if (getMetadata({ path: 'distance.fromStart' }) >= minDistance) {
      recognized()
    }
  }

  function mouseleave (handlerApi) {
    const { getMetadata, denied, setMetadata, event: { target } } = handlerApi

    if (getMetadata({ path: 'mouseStatus' }) === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
      target.removeEventListener(mousemove)
    }

    emit(onLeave, toEmitted(handlerApi))
  }

  function mouseup (handlerApi) {
    const { setMetadata, denied, event: { target } } = handlerApi

    denied()
    setMetadata({ path: 'mouseStatus', value: 'up' })
    target.removeEventListener(mousemove)
    emit(onUp, toEmitted(handlerApi))
  }

  return {
    mousedown,
    // mousemove,
    mouseleave,
    mouseup,
  }
}
