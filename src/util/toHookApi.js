export default function toHookApi ({ event, getSequence, getStatus, getMetadata }) {
  return { event, sequence: getSequence(), status: getStatus(), metadata: getMetadata() }
}
