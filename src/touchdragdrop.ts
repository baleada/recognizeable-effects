import type { RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
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

  const touchstart: RecognizeableEffect<'touchstart', TouchdragdropMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()
    
    metadata.touchTotal = event.touches.length
    storePointerStartMetadata(api)
    
    onStart?.(toHookApi(api))
  }

  const touchmove: RecognizeableEffect<'touchmove', TouchdragdropMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.touchTotal === 1) {
      storePointerMoveMetadata(api)
    } else {
      denied()
    }
    
    onMove?.(toHookApi(api))
  }

  const touchcancel: RecognizeableEffect<'touchcancel', TouchdragdropMetadata> = (event, api) => {
    const { denied } = api

    denied()

    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchdragdropMetadata> = (event, api) => {
    const { getMetadata, setMetadata } = api,
          metadata = getMetadata()

    metadata.touchTotal = metadata.touchTotal - 1
    storePointerMoveMetadata(api)

    recognize(event, api)

    onEnd?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchend', TouchdragdropMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()

    if (metadata.distance.straight.fromStart >= minDistance && metadata.velocity >= minVelocity) {
      recognized()
    } else {
      denied()
    }
  }

  return { touchstart, touchmove, touchcancel, touchend }
}
