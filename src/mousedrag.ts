import type { RecognizeableHandlerApi } from '@baleada/logic'
import { toHookApi, storeStartMetadata, storeMoveMetadata } from './util'
import type { HookApi } from './util'

/*
 * mousedrag is defined as a single click that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not mouseleave or end
 */

export type MousedragOptions = {
  minDistance?: number,
  onDown?: MousedragHook,
  onMove?: MousedragHook,
  onLeave?: MousedragHook,
  onUp?: MousedragHook
}

export type MousedragHook = (api: MousedragHookApi) => any

export type MousedragHookApi = HookApi<MouseEvent>

const defaultOptions = {
  minDistance: 0,
}

export function mousedrag (options: MousedragOptions = {}) {
  const { onDown, onMove, onLeave, onUp } = options,
        minDistance = options.minDistance ?? defaultOptions.minDistance,
        cache: Record<any, any> = {}

  function mousedown (handlerApi: RecognizeableHandlerApi<MouseEvent>) {
    const { event, setMetadata } = handlerApi

    setMetadata({ path: 'mouseStatus', value: 'down' })
    storeStartMetadata(event, handlerApi, 'mouse')

    const { target } = event
    cache.mousemoveListener = event => mousemove({ ...handlerApi, event })
    target.addEventListener('mousemove', cache.mousemoveListener)

    onDown?.(toHookApi(handlerApi))
  }

  function mousemove (handlerApi: RecognizeableHandlerApi<MouseEvent>) {
    const { event } = handlerApi

    storeMoveMetadata(event, handlerApi, 'mouse')
    recognize(handlerApi)

    onMove?.(toHookApi(handlerApi))
  }

  function recognize ({ event, getMetadata, recognized, listener }: RecognizeableHandlerApi<MouseEvent>) {
    if (getMetadata({ path: 'distance.straight.fromStart' }) >= minDistance) {
      recognized()
      listener(event)
    }
  }

  function mouseleave (handlerApi: RecognizeableHandlerApi<MouseEvent>) {
    const { getMetadata, denied, setMetadata, event: { target } } = handlerApi

    if (getMetadata({ path: 'mouseStatus' }) === 'down') {
      denied()
      setMetadata({ path: 'mouseStatus', value: 'leave' })
      target.removeEventListener('mousemove', cache.mousemoveListener)
    }

    onLeave?.(toHookApi(handlerApi))
  }

  function mouseup (handlerApi: RecognizeableHandlerApi<MouseEvent>) {
    const { setMetadata, denied, event: { target } } = handlerApi
    denied()
    setMetadata({ path: 'mouseStatus', value: 'up' })
    target.removeEventListener('mousemove', cache.mousemoveListener)
    onUp?.(toHookApi(handlerApi))
  }

  return {
    mousedown,
    // mousemove,
    mouseleave,
    mouseup,
  }
}
