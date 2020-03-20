import naiveDeepClone from './naiveDeepClone'

export default function toEmitted ({ event, getSequence, getStatus, getMetadata }) {
  return naiveDeepClone({ event, sequence: getSequence(), status: getStatus(), metadata: getMetadata() })
}