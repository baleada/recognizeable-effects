import { emit, toEmitted, storeStartMetadata, storeMoveMetadata, isDefined } from '../util'

/*
 * pan is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not cancel or end
 */

const defaultOptions = {
  minDistance: 0, // TODO: research appropriate/accessible minDistance
}

export default function pan (options = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = isDefined(options.minDistance) ? options.minDistance : defaultOptions.minDistance

  function touchstart (handlerApi) {
    const { event, setMetadata } = handlerApi
    
    setMetadata({ path: 'touchTotal', value: event.touches.length })
    storeStartMetadata(event, handlerApi, 'touch')
    
    emit(onStart, toEmitted(handlerApi))
  }

  function touchmove (handlerApi) {
    const { event, getMetadata, denied } = handlerApi

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

  function touchcancel (handlerApi) {
    const { denied } = handlerApi

    denied()

    emit(onCancel, toEmitted(handlerApi))
  }

  function touchend (handlerApi) {
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
