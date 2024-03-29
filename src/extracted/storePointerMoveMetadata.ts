import type { RecognizeableEffect } from '@baleada/logic'
import { toDirection } from './toDirection'
import type { Direction } from './toDirection'
import { toMousePoint, toTouchMovePoint, toTouchEndPoint } from './toPoints'
import { toPolarCoordinates } from './toPolarCoordinates'
import type { PolarCoordinates } from './toPolarCoordinates'
import type { PointerStartMetadata } from './storePointerStartMetadata'
import { toCloned } from './toCloned'

export type PointerMoveMetadata = {
  distance: {
    straight: {
      fromStart: PolarCoordinates['distance'],
      fromPrevious: PolarCoordinates['distance'],
    },
    horizontal: {
      fromStart: PolarCoordinates['distance'],
      fromPrevious: PolarCoordinates['distance'],
    },
    vertical: {
      fromStart: PolarCoordinates['distance'],
      fromPrevious: PolarCoordinates['distance'],
    }
  },
  angle: {
    fromPrevious: PolarCoordinates['angle'],
    fromStart: PolarCoordinates['angle']
  },
  velocity: number,
  direction: {
    fromPrevious: Direction,
    fromStart: Direction,
  }
}

const initialMetadata: PointerMoveMetadata = {
  distance: {
    straight: {
      fromStart: 0,
      fromPrevious: 0,
    },
    horizontal: {
      fromStart: 0,
      fromPrevious: 0,
    },
    vertical: {
      fromStart: 0,
      fromPrevious: 0,
    }
  },
  angle: {
    fromPrevious: { radians: 0, degrees: 0 },
    fromStart: { radians: 0, degrees: 0 }
  },
  velocity: 0,
  direction: {
    fromPrevious: 'up',
    fromStart: 'up',
  }
}

export function storePointerMoveMetadata<Type extends 'mousemove' | 'mouseup' | 'touchmove' | 'touchend', Metadata extends PointerMoveMetadata & PointerStartMetadata> (event: MouseEvent | TouchEvent, api: Parameters<RecognizeableEffect<Type, Metadata>>[1]): void {
  const { getMetadata } = api,
        metadata = getMetadata()

  if (!metadata.distance) {
    metadata.distance = toCloned(initialMetadata.distance)
    metadata.angle = toCloned(initialMetadata.angle)
    metadata.direction = toCloned(initialMetadata.direction)
  }

  const { x: previousX, y: previousY } = metadata.points.end,
        { x: startX, y: startY } = metadata.points.start,
        { x: newX, y: newY } = (() => {
          if (event instanceof MouseEvent) {
            return toMousePoint(event)
          }

          if (event instanceof TouchEvent) {
            if (event.type === 'touchmove') {
              return toTouchMovePoint(event)
            }

            return toTouchEndPoint(event)
          }
        })(),
        { distance: distanceFromPrevious, angle: angleFromPrevious } = toPolarCoordinates({
          xA: previousX,
          xB: newX,
          yA: previousY,
          yB: newY,
        }),
        { distance: distanceFromStart, angle: angleFromStart } = toPolarCoordinates({
          xA: startX,
          xB: newX,
          yA: startY,
          yB: newY,
        })

  metadata.distance.straight.fromPrevious = distanceFromPrevious
  metadata.distance.horizontal.fromPrevious = newX - previousX
  metadata.distance.vertical.fromPrevious = newY - previousY
  metadata.angle.fromPrevious = angleFromPrevious
  metadata.direction.fromPrevious = toDirection(angleFromPrevious.degrees)
  
  metadata.distance.straight.fromStart = distanceFromStart
  metadata.distance.horizontal.fromStart = newX - startX
  metadata.distance.vertical.fromStart = newY - startY
  metadata.angle.fromStart = angleFromStart
  metadata.direction.fromStart = toDirection(angleFromStart.degrees)
  
  const previousEndTime = metadata.times.end,
        newEndTime = event.timeStamp,
        newEndPoint = { x: newX, y: newY },
        velocity = distanceFromPrevious / (newEndTime - previousEndTime)

  metadata.points.end = newEndPoint
  metadata.times.end = newEndTime
  metadata.velocity = velocity
}

