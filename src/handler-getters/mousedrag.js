import { emit, toEmitted, storeStartMetadata, storeMoveMetadata, isDefined } from '../util'

/*
 * mousedrag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseleave or end
 */

const defaultOptions = {
  minDistance: 0,
}

export default function mousedrag (options = {}) {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = isDefined(options.minDistance) ? options.minDistance : defaultOptions.minDistance,
        cache = {}

  function mousedown (handlerApi) {
    const { event, setMetadata, getMetadata } = handlerApi

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
    recognize(handlerApi)

    emit(onMove, toEmitted(handlerApi))
  }

  function recognize ({ event, getMetadata, recognized, listener }) {
    if (getMetadata({ path: 'distance.fromStart' }) >= minDistance) {
      recognized()
      listener(event)
    }
  }

  function mouseleave (handlerApi) {
    const { getMetadata, denied, setMetadata, event: { target } } = handlerApi

    if (getMetadata({ path: 'mouseStatus' }) === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
      target.removeEventListener('mousemove', cache.mousemoveListener)
    }

    emit(onLeave, toEmitted(handlerApi))
  }

  function mouseup (handlerApi) {
    const { setMetadata, denied, event: { target } } = handlerApi
    denied()
    setMetadata({ path: 'mouseStatus', value: 'up' })
    target.removeEventListener('mousemove', cache.mousemoveListener)
    emit(onUp, toEmitted(handlerApi))
  }

  return {
    mousedown,
    // mousemove,
    mouseleave,
    mouseup,
  }
}
