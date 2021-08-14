import type { RecognizeableEffectApi, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata } from './extracted'
import type { HookApi, PointerStartMetadata, PointerMoveMetadata } from './extracted'

/*
 * touchdragdrop is defined as a single touch that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not cancel
 * - ends
 */

export type TouchdragdropTypes = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel'

export type TouchdragdropMetadata = {
  touchTotal: number
} & PointerStartMetadata & PointerMoveMetadata

export type TouchdragdropOptions = {
  minDistance?: number,
  minVelocity?: number,
  onStart?: TouchdragdropHook,
  onMove?: TouchdragdropHook,
  onCancel?: TouchdragdropHook,
  onEnd?: TouchdragdropHook
}

export type TouchdragdropHook = (api: TouchdragdropHookApi) => any

export type TouchdragdropHookApi = HookApi<TouchdragdropTypes, TouchdragdropMetadata>

const defaultOptions = {
  minDistance: 0,
  minVelocity: 0,
}

export function touchdragdrop (options: TouchdragdropOptions = {}): RecognizeableOptions<TouchdragdropTypes, TouchdragdropMetadata>['effects'] {
  const { onStart, onMove, onCancel, onEnd } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        minVelocity = options.minVelocity ?? defaultOptions.minVelocity

  function touchstart (effectApi: RecognizeableEffectApi<'touchstart', TouchdragdropMetadata>) {
    const { sequenceItem: event, getMetadata } = effectApi,
          metadata = getMetadata()
    
    metadata.touchTotal = event.touches.length
    storePointerStartMetadata(effectApi)
    
    onStart?.(toHookApi(effectApi))
  }

  function touchmove (effectApi: RecognizeableEffectApi<'touchmove', TouchdragdropMetadata>) {
    const { getMetadata, denied } = effectApi,
          metadata = getMetadata()

    if (metadata.touchTotal === 1) {
      storePointerMoveMetadata(effectApi)
    } else {
      denied()
    }
    
    onMove?.(toHookApi(effectApi))
  }

  function touchcancel (effectApi: RecognizeableEffectApi<'touchcancel', TouchdragdropMetadata>) {
    const { denied } = effectApi

    denied()

    onCancel?.(toHookApi(effectApi))
  }

  function touchend (effectApi: RecognizeableEffectApi<'touchend', TouchdragdropMetadata>) {
    const { sequenceItem: event, getMetadata, setMetadata } = effectApi,
          metadata = getMetadata()

    metadata.touchTotal = metadata.touchTotal - 1
    storePointerMoveMetadata(effectApi)

    recognize(effectApi)

    onEnd?.(toHookApi(effectApi))
  }

  function recognize (effectApi: RecognizeableEffectApi<'touchend', TouchdragdropMetadata>) {
    const { getMetadata, recognized, denied } = effectApi,
          metadata = getMetadata()

    if (metadata.distance.straight.fromStart >= minDistance && metadata.velocity >= minVelocity) {
      recognized()
    } else {
      denied()
    }
  }

  return defineEffect => [
    defineEffect('touchstart', touchstart),
    defineEffect('touchmove', touchmove),
    defineEffect('touchcancel', touchcancel),
    defineEffect('touchend', touchend),
  ]
}
