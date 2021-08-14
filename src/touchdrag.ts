import type { RecognizeableEffectApi, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata } from './extracted'
import type { HookApi, PointerStartMetadata, PointerMoveMetadata } from './extracted'

/*
 * touchdrag is defined as a single touch that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not cancel or end
 */

export type TouchdragTypes = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel'

export type TouchdragMetadata = {
  touchTotal: number
} & PointerStartMetadata & PointerMoveMetadata

export type TouchdragOptions = {
  minDistance?: number,
  onStart?: TouchdragHook,
  onMove?: TouchdragHook,
  onCancel?: TouchdragHook,
  onEnd?: TouchdragHook
}

export type TouchdragHook = (api: TouchdragHookApi) => any

export type TouchdragHookApi = HookApi<TouchdragTypes, TouchdragMetadata>

const defaultOptions = {
  minDistance: 0,
}

export function touchdrag (options: TouchdragOptions = {}): RecognizeableOptions<TouchdragTypes, TouchdragMetadata>['effects'] {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance

  function touchstart (effectApi: RecognizeableEffectApi<'touchstart', TouchdragMetadata>) {
    const { sequenceItem: event, getMetadata } = effectApi,
          metadata = getMetadata()
    
    metadata.touchTotal = event.touches.length
    storePointerStartMetadata(effectApi)
    
    onStart?.(toHookApi(effectApi))
  }

  function touchmove (effectApi: RecognizeableEffectApi<'touchmove', TouchdragMetadata>) {
    const { getMetadata, denied } = effectApi,
          metadata = getMetadata()

    if (metadata.touchTotal === 1) {
      storePointerMoveMetadata(effectApi)
      recognize(effectApi)
    } else {
      denied()
    }
    
    onMove?.(toHookApi(effectApi))
  }

  function recognize (effectApi: RecognizeableEffectApi<'touchmove', TouchdragMetadata>) {
    const { getMetadata, recognized } = effectApi,
          metadata = getMetadata()

    if (metadata.distance.straight.fromStart >= minDistance) {
      recognized()
    }
  }

  function touchcancel (effectApi: RecognizeableEffectApi<'touchcancel', TouchdragMetadata>) {
    const { denied } = effectApi

    denied()

    onCancel?.(toHookApi(effectApi))
  }

  function touchend (effectApi: RecognizeableEffectApi<'touchend', TouchdragMetadata>) {
    const { denied } = effectApi

    denied()

    onEnd?.(toHookApi(effectApi))
  }
  
  return defineEffect => [
    defineEffect('touchstart', touchstart),
    defineEffect('touchmove', touchmove),
    defineEffect('touchcancel', touchcancel),
    defineEffect('touchend', touchend),
  ]
}
