import type { ListenEffectParam, RecognizeableEffectApi, RecognizeableOptions } from '@baleada/logic'
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
}

export function mousedragdrop (options: MousedragdropOptions = {}): RecognizeableOptions<MousedragdropTypes, MousedragdropMetadata>['effects'] {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        minVelocity = options.minVelocity ?? defaultOptions.minVelocity,
        cache: { mousemoveEffect?: (event: ListenEffectParam<'mousemove'>) => void } = {}

  function mousedown (effectApi: RecognizeableEffectApi<'mousedown', MousedragdropMetadata>) {
    const { sequenceItem: event, getMetadata } = effectApi,
          metadata = getMetadata()

    metadata.mouseStatus = 'down'
    storePointerStartMetadata(effectApi)

    const { target } = event
    cache.mousemoveEffect = event => mousemove({ ...effectApi, sequenceItem: event })
    target.addEventListener('mousemove', cache.mousemoveEffect)
    
    onDown?.(toHookApi(effectApi))
  }

  function mousemove (effectApi: RecognizeableEffectApi<'mousemove', MousedragdropMetadata>) {
    storePointerMoveMetadata(effectApi)

    onMove?.(toHookApi(effectApi))
  }

  function mouseleave (effectApi: RecognizeableEffectApi<'mouseleave', MousedragdropMetadata>) {
    const { getMetadata, denied, sequenceItem: { target } } = effectApi,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      metadata.mouseStatus = 'leave'
      target.removeEventListener('mousemove', cache.mousemoveEffect)
    }

    onLeave?.(toHookApi(effectApi))
  }

  function mouseup (effectApi: RecognizeableEffectApi<'mouseup', MousedragdropMetadata>) {
    const { getMetadata, sequenceItem: { target } } = effectApi,
          metadata = getMetadata()

    metadata.mouseStatus = 'up'
    storePointerMoveMetadata(effectApi)

    recognize(effectApi)

    target.removeEventListener('mousemove', cache.mousemoveEffect)

    onUp?.(toHookApi(effectApi))
  }

  function recognize (effectApi: RecognizeableEffectApi<'mouseup', MousedragdropMetadata>) {
    const { getMetadata, recognized, denied } = effectApi,
          metadata = getMetadata()
    
    if (metadata.distance.straight.fromStart >= minDistance && metadata.velocity >= minVelocity) {
      recognized()
    } else {
      denied()
    }
  }

  return defineEffect => [
    defineEffect('mousedown', mousedown),
    defineEffect('mouseleave', mouseleave),
    defineEffect('mouseup', mouseup),
  ]
}
