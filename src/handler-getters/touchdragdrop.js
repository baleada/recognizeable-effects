import { toHookApi, storeStartMetadata, storeMoveMetadata } from '../util'

/*
 * touchdragdrop is defined as a single touch that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not cancel
 * - ends
 */

const defaultOptions = {
  minDistance: 0,
  minVelocity: 0,
}

export default function touchdragdrop (options = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        minVelocity = options.minVelocity ?? defaultOptions.minVelocity

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
    } else {
      denied()
    }
    
    onMove?.(toHookApi(handlerApi))
  }

  function touchcancel (handlerApi) {
    const { denied } = handlerApi

    denied()

    onCancel?.(toHookApi(handlerApi))
  }

  function touchend (handlerApi) {
    const { event, getMetadata, setMetadata } = handlerApi

    setMetadata({ path: 'touchTotal', value: getMetadata({ path: 'touchTotal' }) - 1 })
    storeMoveMetadata(event, handlerApi, 'touchend')

    recognize(handlerApi)

    onEnd?.(toHookApi(handlerApi))
  }

  function recognize ({ getMetadata, recognized, denied }) {
    if (getMetadata({ path: 'distance.straight.fromStart' }) >= minDistance && getMetadata({ path: 'velocity' }) >= minVelocity) {
      recognized()
    } else {
      denied()
    }
  }

  return {
    touchstart,
    touchmove,
    touchcancel,
    touchend,
  }
}
