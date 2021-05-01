import type { RecognizeableHandlerApi } from '@baleada/logic'
import { createToPoint } from './createToPoint'
import type { ToPointType } from './createToPoint'
import { toDirection } from './toDirection'

export function storeMoveMetadata (
  event: MouseEvent | TouchEvent,
  handlerApi: RecognizeableHandlerApi<MouseEvent | TouchEvent>,
  type: ToPointType
): void {
  const { getMetadata, toPolarCoordinates, setMetadata } = handlerApi,
        toPoint = createToPoint(type)

  const { x: previousX, y: previousY } = getMetadata({ path: 'points.end' }),
        { x: startX, y: startY } = getMetadata({ path: 'points.start' }),
        // @ts-ignore
        { x: newX, y: newY } = toPoint(event),
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

  setMetadata({ path: 'distance.straight.fromPrevious', value: distanceFromPrevious })
  setMetadata({ path: 'distance.horizontal.fromPrevious', value: newX - previousX })
  setMetadata({ path: 'distance.vertical.fromPrevious', value: newY - previousY })
  setMetadata({ path: 'angle.fromPrevious', value: angleFromPrevious })
  setMetadata({ path: 'direction.fromPrevious', value: toDirection(angleFromPrevious.degrees) })
  
  setMetadata({ path: 'distance.straight.fromStart', value: distanceFromStart })
  setMetadata({ path: 'distance.horizontal.fromStart', value: newX - startX })
  setMetadata({ path: 'distance.vertical.fromStart', value: newY - startY })
  setMetadata({ path: 'angle.fromStart', value: angleFromStart })
  setMetadata({ path: 'direction.fromStart', value: toDirection(angleFromStart.degrees) })
  
  const previousEndTime = getMetadata({ path: 'times.end' }),
        newEndTime = event.timeStamp,
        newEndPoint = { x: newX, y: newY },
        velocity = distanceFromPrevious / (newEndTime - previousEndTime)

  setMetadata({ path: 'points.end', value: newEndPoint })
  setMetadata({ path: 'times.end', value: newEndTime })
  setMetadata({ path: 'velocity', value: velocity })
}

