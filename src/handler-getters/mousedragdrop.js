import { emit, toEmitted, storeStartMetadata, storeMoveMetadata, isDefined } from '../util'

/*
 * dragdrop is defined as a single click that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not mouseleave
 * - ends
 */

const defaultOptions = {
  minDistance: 0,
  minVelocity: 0,
}

export default function dragdrop (options = {}) {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = isDefined(options.minDistance) ? options.minDistance : defaultOptions.minDistance,
        minVelocity = isDefined(options.minVelocity) ? options.minVelocity : defaultOptions.minVelocity,
        cache = {}

  function mousedown (handlerApi) {
    const { event, setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    storeStartMetadata(event, handlerApi, 'mouse')

    const { target } = event
    cache.mousemoveListener = event => mousemove({ ...handlerApi, event })
    target.addEventListener('mousemove', cache.mousemoveListener)
    
    emit(onDown, toEmitted(handlerApi))
  }

  function mousemove (handlerApi) {
    const { event } = handlerApi

    storeMoveMetadata(event, handlerApi, 'mouse')

    emit(onMove, toEmitted(handlerApi))
  }

  function mouseleave (handlerApi) {
    const { getMetadata, setMetadata, denied, event: { target } } = handlerApi

    if (getMetadata({ path: 'mouseStatus' }) === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
      target.removeEventListener('mousemove', cache.mousemoveListener)
    }

    emit(onLeave, toEmitted(handlerApi))
  }

  function mouseup (handlerApi) {
    const { event, setMetadata, event: { target } } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'up' })
    storeMoveMetadata(event, handlerApi, 'mouse')

    recognize(handlerApi)

    target.removeEventListener('mousemove', cache.mousemoveListener)

    emit(onUp, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, recognized, denied }) {
    if (getMetadata({ path: 'distance.fromStart' }) >= minDistance && getMetadata({ path: 'velocity' }) >= minVelocity) {
      recognized()
    } else {
      denied()
    }
  }

  return {
    mousedown,
    // mousemove,
    mouseleave,
    mouseup,
  }
}
