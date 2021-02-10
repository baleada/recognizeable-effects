import { toHookApi, storeStartMetadata, storeMoveMetadata } from '../util'

/*
 * touchdrag is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not cancel or end
 */

const defaultOptions = {
  minDistance: 0, // TODO: research appropriate/accessible minDistance
}

export default function touchdrag (options = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance

  function touchstart (handlerApi) {
    const { event, setMetadata } = handlerApi
    
    setMetadata({ path: 'touchTotal', value: event.touches.length })
    storeStartMetadata(event, handlerApi, 'touch')
    
    onStart?.(toHookApi(handlerApi))
  }

  function touchmove (handlerApi) {
    const { event, getMetadata, denied } = handlerApi

    if (getMetadata({ path: 'touchTotal' }) === 1) {
      storeMoveMetadata(event, handlerApi, 'touch')
      recognize(handlerApi)
    } else {
      denied()
    }
    
    onMove?.(toHookApi(handlerApi))
  }

  function recognize ({ getMetadata, recognized }) {
    if (getMetadata({ path: 'distance.straight.fromStart' }) >= minDistance) {
      recognized()
    }
  }

  function touchcancel (handlerApi) {
    const { denied } = handlerApi

    denied()

    onCancel?.(toHookApi(handlerApi))
  }

  function touchend (handlerApi) {
    const { denied } = handlerApi

    denied()

    onEnd?.(toHookApi(handlerApi))
  }
  
  return {
    touchstart,
    touchmove,
    touchcancel,
    touchend,
  }
}
