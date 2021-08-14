import { Listenable, ListenEffectParam, RecognizeableEffectApi, RecognizeableOptions } from '@baleada/logic'
import { toHookApi, toCloned, toMousePoint, toPolarCoordinates } from './extracted'
import type { HookApi, PointerStartMetadata } from './extracted'

/*
 * clicks is defined as a single mousedown/mouseup combination that:
 * - starts at a given point
 * - does not move beyond a maximum distance
 * - does not mouseleave
 * - ends
 * - repeats 1 time (or a minimum number of your choice), with each click ending less than or equal to 500ms (or a maximum interval of your choice) after the previous click ended
 */

export type ClicksTypes = 'mousedown' | 'mouseleave' | 'mouseup'

export type ClicksMetadata = {
  mouseStatus: 'down' | 'up' | 'leave',
  lastClick: Click,
  clicks: Click[],
}

type Click = {
  times: PointerStartMetadata['times'],
  points: PointerStartMetadata['points'], 
  distance: number,
  interval: number
}

export type ClicksOptions = {
  minClicks?: number,
  maxInterval?: number,
  maxDistance?: number,
  onDown?: ClicksHook,
  onMove?: ClicksHook,
  onLeave?: ClicksHook,
  onUp?: ClicksHook
}

export type ClicksHook = (api: ClicksHookApi) => any

export type ClicksHookApi = HookApi<ClicksTypes, ClicksMetadata>

const defaultOptions = {
  minClicks: 1,
  maxInterval: 500, // Via https://ux.stackexchange.com/questions/40364/what-is-the-expected-timeframe-of-a-double-click
  maxDistance: 5, // TODO: research standard maxDistance
}

const initialClick: Click = {
  times: {
    start: 0,
    end: 0
  },
  points: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 }
  },
  distance: 0,
  interval: 0
}

export function clicks (options: ClicksOptions = {}): RecognizeableOptions<ClicksTypes, ClicksMetadata>['effects'] {
  const { minClicks, maxInterval, maxDistance, onDown, onMove, onLeave, onUp } = { ...defaultOptions, ...options },
        cache: { mousemoveEffect?: (event: ListenEffectParam<'mousemove'>) => void } = {}

  function mousedown (effectApi: RecognizeableEffectApi<ClicksTypes, ClicksMetadata>) {
    const { sequenceItem: event, getMetadata } = effectApi,
          metadata = getMetadata()
    
    metadata.mouseStatus = 'down'
    
    if (!metadata.lastClick) {
      metadata.lastClick = toCloned(initialClick)
    }

    metadata.lastClick.times.start = event.timeStamp
    metadata.lastClick.points.start = toMousePoint(event)

    const { target } = event
    cache.mousemoveEffect = event => mousemove({ ...effectApi, sequenceItem: event })
    target.addEventListener('mousemove', cache.mousemoveEffect)

    onDown?.(toHookApi(effectApi))
  }

  function mousemove (effectApi: RecognizeableEffectApi<ClicksTypes, ClicksMetadata>) {
    onMove?.(toHookApi(effectApi))
  }

  function mouseleave (effectApi: RecognizeableEffectApi<ClicksTypes, ClicksMetadata>) {
    const { getMetadata, denied, sequenceItem: { target } } = effectApi,
          metadata = getMetadata()

    if (metadata.mouseStatus === 'down') {
      denied()
      metadata.mouseStatus = 'leave'
      target.removeEventListener('mousemove', cache.mousemoveEffect)
    }

    onLeave?.(toHookApi(effectApi))
  }

  function mouseup (effectApi: RecognizeableEffectApi<ClicksTypes, ClicksMetadata>) {
    const { sequenceItem: event, getMetadata } = effectApi,
          metadata = getMetadata()

    metadata.mouseStatus = 'up'

    const { x: xA, y: yA } = metadata.lastClick.points.start,
          { clientX: xB, clientY: yB } = event,
          { distance } = toPolarCoordinates({ xA, xB, yA, yB }),
          endPoint = { x: xB, y: yB },
          endTime = event.timeStamp

    metadata.lastClick.points.end = endPoint
    metadata.lastClick.times.end = endTime
    metadata.lastClick.distance = distance

    if (!metadata.clicks) {
      metadata.clicks = []
    }

    const interval = metadata.clicks.length === 0
      ? 0
      : endTime - metadata.clicks[metadata.clicks.length - 1].times.end

    metadata.lastClick.interval = interval

    const newClick = toCloned(metadata.lastClick)
    metadata.clicks.push(newClick)

    recognize(effectApi)

    const { target } = event
    target.removeEventListener('mousemove', cache.mousemoveEffect)

    onUp?.(toHookApi(effectApi))
  }

  function recognize ({ getMetadata, denied, recognized }: RecognizeableEffectApi<ClicksTypes, ClicksMetadata>) {
    const metadata = getMetadata()
    switch (true) {
      case metadata.lastClick.interval > maxInterval || metadata.lastClick.distance > maxDistance: // Deny after multiple touches and after clicks with intervals or movement distances that are too large
        const lastClick = toCloned(metadata.lastClick)
        denied()
        metadata.clicks = [metadata.lastClick]
        break
      default:
        if (metadata.clicks.length >= minClicks) {
          recognized()
        }
        break
      }
  }

  return defineEffect => [
    defineEffect('mousedown', mousedown),
    defineEffect('mouseleave', mouseleave),
    defineEffect('mouseup', mouseup),
  ]
}
