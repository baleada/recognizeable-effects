import type { RecognizeableHandlerApi } from '@baleada/logic'
import { createToPoint } from './createToPoint'
import type { ToPointType } from './createToPoint'

export function storeStartMetadata (
  event: MouseEvent | TouchEvent,
  handlerApi: RecognizeableHandlerApi<MouseEvent | TouchEvent>,
  type: ToPointType
): void {
  const { setMetadata } = handlerApi,
        toPoint = createToPoint(type)

  setMetadata({ path: 'times.start', value: event.timeStamp })
  setMetadata({ path: 'times.end', value: event.timeStamp })
  
  // @ts-ignore
  const point = toPoint(event)
  
  setMetadata({ path: 'points.start', value: point })
  setMetadata({ path: 'points.end', value: point })
}

