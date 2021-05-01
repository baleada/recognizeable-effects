import type { HookApi } from './util';
import type { RecognizeableHandlerApi } from '@baleada/logic';
export declare type TouchesOptions = {
    minTouches?: number;
    maxInterval?: number;
    maxDistance?: number;
    onStart?: TouchesHook;
    onMove?: TouchesHook;
    onCancel?: TouchesHook;
    onEnd?: TouchesHook;
};
export declare type TouchesHook = (api: TouchesHookApi) => any;
export declare type TouchesHookApi = HookApi<TouchEvent>;
export declare function touches(options?: TouchesOptions): {
    touchstart: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchmove: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchcancel: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchend: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
};
