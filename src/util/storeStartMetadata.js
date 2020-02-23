import getGetPoint from './getGetPoint'

export default function storeStartMetadata (event, handlerApi, type) {
  const { setMetadata } = handlerApi,
        getPoint = getGetPoint(type)

  setMetadata({ path: 'times.start', value: event.timeStamp })
  setMetadata({ path: 'times.end', value: event.timestamp })
  
  const point = getPoint(event)
  
  setMetadata({ path: 'points.start', value: point })
  setMetadata({ path: 'points.end', value: point })
}

