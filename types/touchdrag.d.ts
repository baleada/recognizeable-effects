import type { RecognizeableHandlerApi } from '@baleada/logic';
import type { HookApi } from './util';
export declare type TouchdragOptions = {
    minDistance?: number;
    onStart?: TouchdragHook;
    onMove?: TouchdragHook;
    onCancel?: TouchdragHook;
    onEnd?: TouchdragHook;
};
export declare type TouchdragHook = (api: TouchdragHookApi) => any;
export declare type TouchdragHookApi = HookApi<TouchEvent>;
export declare function touchdrag(options?: TouchdragOptions): {
    touchstart: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchmove: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchcancel: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchend: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
};
