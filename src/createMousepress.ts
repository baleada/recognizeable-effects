import type { ListenEffectParam, RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, storePointerStartMetadata, storePointerMoveMetadata, storePointerTimeMetadata } from './extracted'
import type { PointerStartMetadata, PointerMoveMetadata, PointerTimeMetadata, HookApi } from './extracted'

/*
 * mousepress is defined as a single mousedown that:
 * - starts at a given point
 * - travels a distance greater than or equal to 0px (or a minimum distance of your choice)
 * - does not mouseleave or end before 0ms (or a minimum duration of your choice) has elapsed
 */

export type MousepressTypes = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousepressMetadata = PointerStartMetadata
  & PointerMoveMetadata
  & PointerTimeMetadata

export type MousepressOptions = {
  minDuration?: number,
  minDistance?: number,
  getMousemoveTarget?: (event: MouseEvent) => HTMLElement,
  onDown?: MousepressHook,
  onMove?: MousepressHook,
  onLeave?: MousepressHook,
  onUp?: MousepressHook,
}

export type MousepressHook = (api: MousepressHookApi) => any

export type MousepressHookApi = HookApi<MousepressTypes, MousepressMetadata>

const defaultOptions: MousepressOptions = {
  minDuration: 0,
  minDistance: 0,
  getMousemoveTarget: (event: MouseEvent) => event.target as HTMLElement,
}

export function createMousepress (options: MousepressOptions = {}): RecognizeableOptions<MousepressTypes, MousepressMetadata>['effects'] {
  const {
          minDuration,
          minDistance,
          getMousemoveTarget,
          onDown,
          onLeave,
          onMove,
          onUp
        } = { ...defaultOptions, ...options },
        cleanup = (event: MouseEvent) => {
          window.cancelAnimationFrame(request)
          getMousemoveTarget(event).removeEventListener('mousemove', mousemoveEffect)
        }
  
  let request: number
  let mousemoveEffect: (event: ListenEffectParam<'mousemove'>) => void
  let mouseStatus: 'down' | 'up' | 'leave'

  const mousedown: RecognizeableEffect<'mousedown', MousepressMetadata> = (event, api) => {
    mouseStatus = 'down'
    // @ts-expect-error
    mousemoveEffect = event => mousemove(event, api)

    storePointerStartMetadata(event, api)
    storePointerMoveMetadata(event, api)
    storePointerTimeMetadata(
      event,
      api,
      () => mouseStatus === 'down',
      newRequest => request = newRequest,
      recognize,
    )

    getMousemoveTarget(event).addEventListener('mousemove', mousemoveEffect)

    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<'mousemove', MousepressMetadata> = (event, api) => {
    storePointerMoveMetadata(event, api)
    recognize(event, api)

    onMove?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'mousedown' | 'mousemove', MousepressMetadata> = (event, api) => {
    const { getMetadata, recognized, onRecognized } = api,
          metadata = getMetadata()

    if (
      metadata.duration >= minDuration
      && metadata.distance.straight.fromStart >= minDistance
    ) {
      recognized()
      onRecognized(event)
    }
  }

  const mouseleave: RecognizeableEffect<'mouseleave', MousepressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (mouseStatus === 'down') {
      denied()
      cleanup(event)
      mouseStatus = 'leave'
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<'mouseup', MousepressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (mouseStatus !== 'down') return
          
    denied()
    cleanup(event)
    mouseStatus = 'up'
    
    onUp?.(toHookApi(api))
  }

  return {
    mousedown,
    mouseleave,
    mouseup,
  }
}
