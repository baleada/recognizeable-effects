import type { RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
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

const defaultOptions: TouchdragOptions = {
  minDistance: 0,
}

export function touchdrag (options: TouchdragOptions = {}): RecognizeableOptions<TouchdragTypes, TouchdragMetadata>['effects'] {
  const { minDistance, onStart, onMove, onCancel, onEnd } = { ...defaultOptions, ...options }

  const touchstart: RecognizeableEffect<'touchstart', TouchdragMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()
    
    metadata.touchTotal = event.touches.length
    storePointerStartMetadata(event, api)
    
    onStart?.(toHookApi(api))
  }

  const touchmove: RecognizeableEffect<'touchmove', TouchdragMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.touchTotal === 1) {
      storePointerMoveMetadata(event, api)
      recognize(event, api)
    } else {
      denied()
    }
    
    onMove?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'touchmove', TouchdragMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (metadata.distance.straight.fromStart >= minDistance) {
      recognized()
    }
  }

  const touchcancel: RecognizeableEffect<'touchcancel', TouchdragMetadata> = (event, api) => {
    const { denied } = api

    denied()

    onCancel?.(toHookApi(api))
  }

  const touchend: RecognizeableEffect<'touchend', TouchdragMetadata> = (event, api) => {
    const { denied } = api

    denied()

    onEnd?.(toHookApi(api))
  }
  
  return { touchstart, touchmove, touchcancel, touchend }
}
