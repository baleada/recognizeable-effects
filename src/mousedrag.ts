import type { ListenEffectParam, RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, PointerStartMetadata, PointerMoveMetadata } from './extracted'
import type { HookApi } from './extracted'

/*
 * mousedrag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseleave or end
 */

export type MousedragTypes = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousedragMetadata = {
  mouseStatus: 'down' | 'up' | 'leave',
} & PointerStartMetadata & PointerMoveMetadata

export type MousedragOptions = {
  minDistance?: number,
  getMousemoveTarget?: (event: MouseEvent) => HTMLElement,
  onDown?: MousedragHook,
  onMove?: MousedragHook,
  onLeave?: MousedragHook,
  onUp?: MousedragHook
}

export type MousedragHook = (api: MousedragHookApi) => any

export type MousedragHookApi = HookApi<MousedragTypes, MousedragMetadata>

const defaultOptions = {
  minDistance: 0,
  getMousemoveTarget: (event: MouseEvent) => event.target as HTMLElement,
}

export function mousedrag (options: MousedragOptions = {}): RecognizeableOptions<MousedragTypes, MousedragMetadata>['effects'] {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        getMousemoveTarget = options.getMousemoveTarget ?? defaultOptions.getMousemoveTarget,
        cache: { mousemoveEffect?: (event: ListenEffectParam<'mousemove'>) => void } = {}

  const mousedown: RecognizeableEffect<'mousedown', MousedragMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.mouseStatus = 'down'
    storePointerStartMetadata(api as Parameters<RecognizeableEffect<'mousedown', MousedragMetadata>>[1])

    const { target } = event
    cache.mousemoveEffect = event => mousemove(event, api)
    getMousemoveTarget(event).addEventListener('mousemove', cache.mousemoveEffect)

    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<'mousemove', MousedragMetadata> = (event, api) => {
    storePointerMoveMetadata(api)
    recognize(event, api)

    onMove?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'mousemove', MousedragMetadata> = (event, api) => {
    const { getMetadata, recognized, onRecognized } = api,
          metadata = getMetadata()

    if (metadata.distance.straight.fromStart >= minDistance) {
      recognized()
      onRecognized(event)
    }
  }

  const mouseleave: RecognizeableEffect<'mouseleave', MousedragMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      metadata.mouseStatus = 'leave'
      getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<'mouseup', MousedragMetadata> = (event, api) => {
    const { target } = event,
          { getMetadata, denied } = api,
          metadata = getMetadata()
          
    denied()
    metadata.mouseStatus = 'up'
    target.removeEventListener('mousemove', cache.mousemoveEffect)
    onUp?.(toHookApi(api))
  }

  return { mousedown, mouseleave, mouseup }
}
