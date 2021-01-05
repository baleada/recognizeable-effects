import { toHookApi, storeStartMetadata, storeMoveMetadata } from '../util'

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
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        cache = {}

  function mousedown (handlerApi) {
    const { event, setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    storeStartMetadata(event, handlerApi, 'mouse')

    const { target } = event
    cache.mousemoveListener = event => mousemove({ ...handlerApi, event })
    target.addEventListener('mousemove', cache.mousemoveListener)

    onDown?.(toHookApi(handlerApi))
  }

  function mousemove (handlerApi) {
    const { event } = handlerApi

    storeMoveMetadata(event, handlerApi, 'mouse')
    recognize(handlerApi)

    onMove?.(toHookApi(handlerApi))
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

    onLeave?.(toHookApi(handlerApi))
  }

  function mouseup (handlerApi) {
    const { setMetadata, denied, event: { target } } = handlerApi
    denied()
    setMetadata({ path: 'mouseStatus', value: 'up' })
    target.removeEventListener('mousemove', cache.mousemoveListener)
    onUp?.(toHookApi(handlerApi))
  }

  return {
    mousedown,
    // mousemove,
    mouseleave,
    mouseup,
  }
}
