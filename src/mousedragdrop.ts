import type { ListenEffectParam, RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata } from './extracted'
import type { HookApi, PointerMoveMetadata, PointerStartMetadata } from './extracted'

/*
 * mousedragdrop is defined as a single click that:
 * - starts at a given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - travels at a velocity of greater than 0px/ms (or a minimum velocity of your choice)
 * - does not mouseleave
 * - ends
 */

export type MousedragdropTypes = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousedragdropMetadata = {
  mouseStatus: 'down' | 'up' | 'leave',
} & PointerStartMetadata & PointerMoveMetadata

export type MousedragdropOptions = {
  minDistance?: number,
  minVelocity?: number,
  getMousemoveTarget?: (event: MouseEvent) => HTMLElement,
  onDown?: MousedragdropHook,
  onMove?: MousedragdropHook,
  onLeave?: MousedragdropHook,
  onUp?: MousedragdropHook
}

export type MousedragdropHook = (api: MousedragdropHookApi) => any

export type MousedragdropHookApi = HookApi<MousedragdropTypes, MousedragdropMetadata>

const defaultOptions = {
  minDistance: 0,
  minVelocity: 0,
  getMousemoveTarget: (event: MouseEvent) => event.target as HTMLElement,
}

export function mousedragdrop (options: MousedragdropOptions = {}): RecognizeableOptions<MousedragdropTypes, MousedragdropMetadata>['effects'] {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        minVelocity = options.minVelocity ?? defaultOptions.minVelocity,
        getMousemoveTarget = options.getMousemoveTarget ?? defaultOptions.getMousemoveTarget,
        cache: { mousemoveEffect?: (event: ListenEffectParam<'mousemove'>) => void } = {}

  const mousedown: RecognizeableEffect<'mousedown', MousedragdropMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.mouseStatus = 'down'
    storePointerStartMetadata(api)

    const { target } = event
    cache.mousemoveEffect = event => mousemove(event, api)
    getMousemoveTarget(event).addEventListener('mousemove', cache.mousemoveEffect)
    
    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<'mousemove', MousedragdropMetadata> = (event, api) => {
    storePointerMoveMetadata(api)

    onMove?.(toHookApi(api))
  }

  const mouseleave: RecognizeableEffect<'mouseleave', MousedragdropMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      metadata.mouseStatus = 'leave'
      getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<'mouseup', MousedragdropMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.mouseStatus = 'up'
    storePointerMoveMetadata(api)

    recognize(event, api)

    getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)

    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'mouseup', MousedragdropMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()
    
    if (metadata.distance.straight.fromStart >= minDistance && metadata.velocity >= minVelocity) {
      recognized()
    } else {
      denied()
    }
  }

  return { mousedown, mouseleave, mouseup }
}
