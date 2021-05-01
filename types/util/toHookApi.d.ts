import type { RecognizeableStatus, RecognizeableSupportedEvent } from '@baleada/logic';
export declare type HookApi<EventType extends RecognizeableSupportedEvent> = {
    event: EventType;
    sequence: EventType[];
    status: RecognizeableStatus;
    metadata: Record<any, any>;
};
export declare function toHookApi<EventType extends RecognizeableSupportedEvent>({ event, getSequence, getStatus, getMetadata }: {
    event: EventType;
    getSequence: () => EventType[];
    getStatus: () => RecognizeableStatus;
    getMetadata: () => Record<any, any>;
}): HookApi<EventType>;
