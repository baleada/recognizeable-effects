import { emit, toEmitted, storeStartMetadata, storeMoveMetadata } from '../util'

/*
 * swipe is defined as a single touch that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not cancel
 * - ends
 */
export default function swipe (options = {}) {
  options = {
    minDistance: 0,
    minVelocity: 0,
    ...options,
  }

  const {
    onStart,
    onMove,
    onCancel,
    onEnd,
    minDistance,
    minVelocity,
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
    } else {
      denied()
    }
    
    emit(onMove, toEmitted(handlerApi))
  }

  function touchcancel (event, handlerApi) {
    const { denied } = handlerApi

    denied()

    emit(onCancel, toEmitted(handlerApi))
  }

  function touchend (event, handlerApi) {
    const { getMetadata, setMetadata } = handlerApi

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
