import type { RecognizeableStatus, RecognizeableSupportedEvent } from '@baleada/logic'

export type HookApi<EventType extends RecognizeableSupportedEvent> = {
  event: EventType,
  sequence: EventType[],
  status: RecognizeableStatus,
  metadata: Record<any, any>
}

export function toHookApi<EventType extends RecognizeableSupportedEvent> ({ event, getSequence, getStatus, getMetadata }: {
  event: EventType,
  getSequence: () => EventType[],
  getStatus: () => RecognizeableStatus,
  getMetadata: () => Record<any, any>,
}): HookApi<EventType> {
  return { event, sequence: getSequence(), status: getStatus(), metadata: getMetadata() }
}
