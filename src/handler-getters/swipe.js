import { emit, toEmitted, storeStartMetadata, storeMoveMetadata, isDefined } from '../util'

/*
 * swipe is defined as a single touch that:
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

export default function swipe (options = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = isDefined(options.minDistance) ? options.minDistance : defaultOptions.minDistance,
        minVelocity = isDefined(options.minVelocity) ? options.minVelocity : defaultOptions.minVelocity

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
    } else {
      denied()
    }
    
    emit(onMove, toEmitted(handlerApi))
  }

  function touchcancel (handlerApi) {
    const { denied } = handlerApi

    denied()

    emit(onCancel, toEmitted(handlerApi))
  }

  function touchend (handlerApi) {
    const { event, getMetadata, setMetadata } = handlerApi

    setMetadata({ path: 'touchTotal', value: getMetadata().touchTotal - 1 })
    storeMoveMetadata(event, handlerApi, 'touchend')

    recognize(handlerApi)

    emit(onEnd, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, recognized, denied }) {
    if (getMetadata().distance.fromStart >= minDistance && getMetadata().velocity >= minVelocity) {
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
