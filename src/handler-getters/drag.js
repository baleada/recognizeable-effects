import { emit, toEmitted, storeStartMetadata, storeMoveMetadata, isDefined } from '../util'

/*
 * drag is defined as a single drag that:
 * - starts at given point
 * - travels a distance greater than 0px (or a minimum distance of your choice)
 * - does not dragleave or end
 */

const defaultOptions = {
  minDistance: 0,
}

export default function drag (options = {}) {
  const { onStart, onDrag, onLeave, onEnd } = options,
        minDistance = isDefined(options.minDistance) ? options.minDistance : defaultOptions.minDistance

  function dragstart (handlerApi) {
    const { event } = handlerApi

    storeStartMetadata(event, handlerApi, 'mouse')

    emit(onStart, toEmitted(handlerApi))
  }

  function drag (handlerApi) {
    const { event } = handlerApi

    storeMoveMetadata(event, handlerApi, 'mouse')
    recognize(handlerApi)

    emit(onDrag, toEmitted(handlerApi))
  }

  function recognize ({ getMetadata, recognized }) {
    if (getMetadata({ path: 'distance.fromStart' }) >= minDistance) {
      recognized()
    }
  }

  function dragleave (handlerApi) {
    emit(onLeave, toEmitted(handlerApi))
  }

  function dragend (handlerApi) {
    const { denied } = handlerApi

    denied()
    emit(onEnd, toEmitted(handlerApi))
  }

  return {
    dragstart,
    drag,
    dragleave,
    dragend,
  }
}
