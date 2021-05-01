import type { RecognizeableHandlerApi } from '@baleada/logic'
import { toHookApi, storeStartMetadata, storeMoveMetadata } from './util'
import type { HookApi } from './util'

/*
 * touchdrag is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not cancel or end
 */

export type TouchdragOptions = {
  minDistance?: number,
  onStart?: TouchdragHook,
  onMove?: TouchdragHook,
  onCancel?: TouchdragHook,
  onEnd?: TouchdragHook
}

export type TouchdragHook = (api: TouchdragHookApi) => any

export type TouchdragHookApi = HookApi<TouchEvent>

const defaultOptions = {
  minDistance: 0,
}

export function touchdrag (options: TouchdragOptions = {}) {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance

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
      recognize(handlerApi)
    } else {
      denied()
    }
    
    onMove?.(toHookApi(handlerApi))
  }

  function recognize ({ getMetadata, recognized }: RecognizeableHandlerApi<TouchEvent>) {
    if (getMetadata({ path: 'distance.straight.fromStart' }) >= minDistance) {
      recognized()
    }
  }

  function touchcancel (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
    const { denied } = handlerApi

    denied()

    onCancel?.(toHookApi(handlerApi))
  }

  function touchend (handlerApi: RecognizeableHandlerApi<TouchEvent>) {
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
