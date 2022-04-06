import { ListenEffectParam, RecognizeableEffect, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, toCloned, toMousePoint, toPolarCoordinates } from './extracted'
import type { HookApi, PointerStartMetadata } from './extracted'

/*
 * mousepress is defined as a single mousedown that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not mouseleave
 * - does not end before 500ms (or a minimum duration of your choice) has elapsed
 */

export type MousepressTypes = 'mousedown' | 'mouseleave' | 'mouseup'

export type MousepressMetadata = {
  mouseStatus: 'down' | 'up' | 'leave',
  times: PointerStartMetadata['times'],
  points: PointerStartMetadata['points'],
  distance: number,
  duration: number,
}

export type MousepressOptions = {
  minDuration?: number,
  maxDistance?: number,
  getMousemoveTarget?: (event: MouseEvent) => HTMLElement,
  onDown?: MousepressHook,
  onMove?: MousepressHook,
  onLeave?: MousepressHook,
  onUp?: MousepressHook
}

export type MousepressHook = (api: MousepressHookApi) => any

export type MousepressHookApi = HookApi<MousepressTypes, MousepressMetadata>

const defaultOptions: MousepressOptions = {
  minDuration: 500, // Via https://github.com/adobe/react-spectrum/blob/57ceb1ceb0092d523db9d379ce9ff8e60e421a69/packages/%40react-aria/interactions/src/useLongPress.ts#L33-L37
  maxDistance: 5, // TODO: research standard maxDistance
  getMousemoveTarget: (event: MouseEvent) => event.target as HTMLElement,
}

const initialMeta = {
  times: {
    start: 0,
    end: 0
  },
  points: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 }
  },
  distance: 0,
}

export function mousepress (options: MousepressOptions = {}): RecognizeableOptions<MousepressTypes, MousepressMetadata>['effects'] {
  const { minDuration, maxDistance, getMousemoveTarget, onDown, onMove, onLeave, onUp } = { ...defaultOptions, ...options },
        cache: {
          mousemoveEffect?: (event: ListenEffectParam<'mousemove'>) => void,
          request?: number,
        } = {}

  const mousedown: RecognizeableEffect<MousepressTypes, MousepressMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata()
    
    metadata.mouseStatus = 'down'

    if (!metadata.times) {
      metadata.times = toCloned(initialMeta.times)
      metadata.points = toCloned(initialMeta.points)
      metadata.distance = 0
    }
    
    metadata.times.start = event.timeStamp
    metadata.points.start = toMousePoint(event)

    cache.mousemoveEffect = event => mousemove(event, api)
    getMousemoveTarget(event).addEventListener('mousemove', cache.mousemoveEffect)

    const storeDuration = () => {
      cache.request = requestAnimationFrame(timestamp => {
        if (metadata.mouseStatus === 'down') {
          metadata.times.end = timestamp
          metadata.duration = timestamp - metadata.times.start
          
          recognize(event, api)
          
          if (api.getStatus() === 'recognizing') storeDuration()
        }
      })
    }

    storeDuration()

    onDown?.(toHookApi(api))
  }

  const mousemove: RecognizeableEffect<MousepressTypes, MousepressMetadata> = (event, api) => {
    const { getMetadata } = api,
          metadata = getMetadata(),
          { x: xA, y: yA } = metadata.points.start,
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.points.end = endPoint
    metadata.times.end = endTime
    metadata.distance = distance

    onMove?.(toHookApi(api))
  }

  const mouseleave: RecognizeableEffect<MousepressTypes, MousepressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      window.cancelAnimationFrame(cache.request)
      metadata.mouseStatus = 'leave'
      getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)
    }

    onLeave?.(toHookApi(api))
  }

  const mouseup: RecognizeableEffect<MousepressTypes, MousepressMetadata> = (event, api) => {
    const { getMetadata, denied } = api,
          metadata = getMetadata()
    
    denied()
    window.cancelAnimationFrame(cache.request)
    metadata.mouseStatus = 'up'

    const { x: xA, y: yA } = metadata.points.start,
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.points.end = endPoint
    metadata.times.end = endTime
    metadata.distance = distance

    getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)
    
    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<MousepressTypes, MousepressMetadata> = (event, { getMetadata, denied, recognized, onRecognized }) => {
    const metadata = getMetadata()

    // Deny after presses with movement distances that are too large
    if (metadata.distance > maxDistance) {
      denied()
      window.cancelAnimationFrame(cache.request)
      getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)
      return
    }

    if (metadata.duration >= minDuration) {
      recognized()
      window.cancelAnimationFrame(cache.request)
      getMousemoveTarget(event).removeEventListener('mousemove', cache.mousemoveEffect)
      onRecognized(event)
    }
  }

  return { mousedown, mouseleave, mouseup }
}
