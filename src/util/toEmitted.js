import naiveDeepClone from './naiveDeepClone'

export default function toEmitted ({ getStatus, getLastEvent, getMetadata }) {
  return naiveDeepClone({ status: getStatus(), lastEvent: getLastEvent(), metadata: getMetadata() })
}