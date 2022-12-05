import type { RecognizeableEffect } from '@baleada/logic'
import { toCloned } from './toCloned'

export type KeydownStartMetadata = {
  times: {
    start: number,
    end: number,
  },
}

const initialMetadata: KeydownStartMetadata = {
  times: {
    start: 0,
    end: 0
  },
}

export function storeKeydownStartMetadata<Type extends 'keydown', Metadata extends KeydownStartMetadata> (event: KeyboardEvent, api: Parameters<RecognizeableEffect<Type, Metadata>>[1]) {
  const { getMetadata } = api,
        metadata = getMetadata()

  if (!metadata.times) {
    metadata.times = toCloned(initialMetadata.times)
  }

  metadata.times.start = event.timeStamp
  metadata.times.end = event.timeStamp
}
