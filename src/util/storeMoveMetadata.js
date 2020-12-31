import lookupToPoint from './lookupToPoint'
import toDirection from './toDirection'

export default function storeMoveMetadata (event, handlerApi, type) {
  const { getMetadata, toPolarCoordinates, setMetadata } = handlerApi,
        getPoint = lookupToPoint(type)

  const { x: previousX, y: previousY } = getMetadata().points.end,
        { x: startX, y: startY } = getMetadata().points.start,
        { x: newX, y: newY } = getPoint(event),
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

  setMetadata({ path: 'distance.fromPrevious', value: distanceFromPrevious })
  setMetadata({ path: 'angle.fromPrevious', value: angleFromPrevious })
  setMetadata({ path: 'direction.fromPrevious', value: toDirection(angleFromPrevious.degrees) })
  
  setMetadata({ path: 'distance.fromStart', value: distanceFromStart })
  setMetadata({ path: 'angle.fromStart', value: angleFromStart })
  setMetadata({ path: 'direction.fromStart', value: toDirection(angleFromStart.degrees) })
  
  const previousEndTime = getMetadata().times.end,
        newEndTime = event.timeStamp,
        newEndPoint = { x: newX, y: newY },
        velocity = distanceFromPrevious / (newEndTime - previousEndTime)

  setMetadata({ path: 'points.end', value: newEndPoint })
  setMetadata({ path: 'times.end', value: newEndTime })
  setMetadata({ path: 'velocity', value: velocity })
}

