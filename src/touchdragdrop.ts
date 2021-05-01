import type { RecognizeableHandlerApi } from '@baleada/logic'
import { toHookApi, storeStartMetadata, storeMoveMetadata } from './util'
import type { HookApi } from './util'

/*
 * touchdragdrop is defined as a single touch that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not cancel
 * - ends
 */

export type TouchdragdropOptions = {
  minDistance?: number,
  minVelocity?: number,
  onStart?: TouchdragdropHook,
  onMove?: TouchdragdropHook,
  onCancel?: TouchdragdropHook,
  onEnd?: TouchdragdropHook
}

export type TouchdragdropHook = (api: TouchdragdropHookApi) => any

export type TouchdragdropHookApi = HookApi<TouchEvent>

const defaultOptions = {
  minDistance: 0,
  minVelocity: 0,
}

export function touchdragdrop (options: TouchdragdropOptions = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        minVelocity = options.minVelocity ?? defaultOptions.minVelocity

  function touchstart (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { event, setMetadata } = handlerApi
    
    setMetadata({ path: 'touchTotal', value: event.touches.length })
    storeStartMetadata(event, handlerApi, 'touch')
    
    onStart?.(toHookApi(handlerApi))
  }

  function touchmove (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { event, getMetadata, denied } = handlerApi

    if (getMetadata({ path: 'touchTotal' }) === 1) {
      storeMoveMetadata(event, handlerApi, 'touch')
    } else {
      denied()
    }
    
    onMove?.(toHookApi(handlerApi))
  }

  function touchcancel (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { denied } = handlerApi

    denied()

    onCancel?.(toHookApi(handlerApi))
  }

  function touchend (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { event, getMetadata, setMetadata } = handlerApi

    setMetadata({ path: 'touchTotal', value: getMetadata({ path: 'touchTotal' }) - 1 })
    storeMoveMetadata(event, handlerApi, 'touchend')

    recognize(handlerApi)

    onEnd?.(toHookApi(handlerApi))
  }

  function recognize ({ getMetadata, recognized, denied }: RecognizeableHandlerApi<TouchEvent>) {
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
