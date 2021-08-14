import type { RecognizeableEffectApi } from '@baleada/logic'
import { toCloned } from './toCloned'
import { toMousePoint, toTouchMovePoint } from './toPoints'

export type PointerStartMetadata = {
  times: {
    start: number,
    end: number,
  },
  points: {
    start: { x: number, y: number },
    end: { x: number, y: number },
  }
}

const initialMetadata: PointerStartMetadata = {
  times: {
    start: 0,
    end: 0
  },
  points: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 }
  }
}

export function storePointerStartMetadata<Type extends 'mousedown' | 'touchstart', Metadata extends PointerStartMetadata> (effectApi: RecognizeableEffectApi<Type, Metadata>): void {
  const { sequenceItem: event, getMetadata } = effectApi,
        metadata = getMetadata()

  if (!metadata.times) {
    metadata.times = toCloned(initialMetadata.times)
    metadata.points = toCloned(initialMetadata.points)
  }

  metadata.times.start = event.timeStamp
  metadata.times.end = event.timeStamp
  
  const point = (() => {
    if (event instanceof MouseEvent) {
      return toMousePoint(event)
    }

    if (event instanceof TouchEvent) {
      return toTouchMovePoint(event)
    }
  })()
  
  metadata.points.start = point
  metadata.points.end = point
}
