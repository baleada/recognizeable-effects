import type { ListenEffectParam, RecognizeableEffectApi, RecognizeableOptions } from '@baleada/logic'
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
  onDown?: MousedragHook,
  onMove?: MousedragHook,
  onLeave?: MousedragHook,
  onUp?: MousedragHook
}

export type MousedragHook = (api: MousedragHookApi) => any

export type MousedragHookApi = HookApi<MousedragTypes, MousedragMetadata>

const defaultOptions = {
  minDistance: 0,
}

export function mousedrag (options: MousedragOptions = {}): RecognizeableOptions<MousedragTypes, MousedragMetadata>['effects'] {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        cache: { mousemoveEffect?: (event: ListenEffectParam<'mousemove'>) => void } = {}

  function mousedown (effectApi: RecognizeableEffectApi<'mousedown', MousedragMetadata>) {
    const { sequenceItem: event, getMetadata } = effectApi,
          metadata = getMetadata()

    metadata.mouseStatus = 'down'
    storePointerStartMetadata(effectApi as RecognizeableEffectApi<'mousedown', MousedragMetadata>)

    const { target } = event
    cache.mousemoveEffect = event => mousemove({ ...effectApi, sequenceItem: event })
    target.addEventListener('mousemove', cache.mousemoveEffect)

    onDown?.(toHookApi(effectApi))
  }

  function mousemove (effectApi: RecognizeableEffectApi<'mousemove', MousedragMetadata>) {
    storePointerMoveMetadata(effectApi)
    recognize(effectApi)

    onMove?.(toHookApi(effectApi))
  }

  function recognize (effectApi: RecognizeableEffectApi<'mousemove', MousedragMetadata>) {
    const { sequenceItem: event, getMetadata, recognized, onRecognized } = effectApi,
          metadata = getMetadata()

    if (metadata.distance.straight.fromStart >= minDistance) {
      recognized()
      onRecognized(event)
    }
  }

  function mouseleave (effectApi: RecognizeableEffectApi<'mouseleave', MousedragMetadata>) {
    const { getMetadata, denied, sequenceItem: { target } } = effectApi,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      metadata.mouseStatus = 'leave'
      target.removeEventListener('mousemove', cache.mousemoveEffect)
    }

    onLeave?.(toHookApi(effectApi))
  }

  function mouseup (effectApi: RecognizeableEffectApi<'mouseup', MousedragMetadata>) {
    const { getMetadata, denied, sequenceItem: { target } } = effectApi,
          metadata = getMetadata()
          
    denied()
    metadata.mouseStatus = 'up'
    target.removeEventListener('mousemove', cache.mousemoveEffect)
    onUp?.(toHookApi(effectApi))
  }

  return defineEffect => [
    defineEffect('mousedown', mousedown),
    defineEffect('mouseleave', mouseleave),
    defineEffect('mouseup', mouseup),
  ]
}
