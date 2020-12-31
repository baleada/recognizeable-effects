import lookupToPoint from './lookupToPoint'

export default function storeStartMetadata (event, handlerApi, type) {
  const { setMetadata } = handlerApi,
        toPoint = lookupToPoint(type)

  setMetadata({ path: 'times.start', value: event.timeStamp })
  setMetadata({ path: 'times.end', value: event.timestamp })
  
  const point = toPoint(event)
  
  setMetadata({ path: 'points.start', value: point })
  setMetadata({ path: 'points.end', value: point })
}

