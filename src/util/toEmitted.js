import naiveDeepClone from './naiveDeepClone'

export default function toEmitted ({ getSequence, getStatus, getLastEvent, getMetadata }) {
  return naiveDeepClone({ sequence: getSequence(), status: getStatus(), lastEvent: getLastEvent(), metadata: getMetadata() })
}