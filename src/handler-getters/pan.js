import { emit, toEmitted, storeStartMetadata, storeMoveMetadata } from '../util'

/*
 * pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not cancel or end
 */

export default function pan (options = {}) {
  options = {
    minDistance: 5, // TODO: research appropriate/accessible minDistance
    ...options,
  }

  const {
    onStart,
    onMove,
    onCancel,
    onEnd,
    minDistance
  } = options

  function touchstart (event, handlerApi) {
    const { setMetadata } = handlerApi
    
    setMetadata({ path: 'touchTotal', value: event.touches.length })
    storeStartMetadata(event, handlerApi, 'touch')
    
    emit(onStart, toEmitted(handlerApi))
  }

  function touchmove (event, handlerApi) {
    const { getMetadata, denied } = handlerApi

    if (getMetadata().touchTotal === 1) {
      storeMoveMetadata(event, handlerApi, 'touch')
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

  function touchcancel (event, handlerApi) {
    const { denied } = handlerApi

    denied()

    emit(onCancel, toEmitted(handlerApi))
  }

  function touchend (event, handlerApi) {
    const { denied } = handlerApi

    denied()

    emit(onEnd, toEmitted(handlerApi))
  }
  
  return {
    touchstart,
    touchmove,
    touchcancel,
    touchend,
  }
}
