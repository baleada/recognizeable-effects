import type { RecognizeableHandlerApi } from '@baleada/logic';
import type { HookApi } from './util';
export declare type TouchdragdropOptions = {
    minDistance?: number;
    minVelocity?: number;
    onStart?: TouchdragdropHook;
    onMove?: TouchdragdropHook;
    onCancel?: TouchdragdropHook;
    onEnd?: TouchdragdropHook;
};
export declare type TouchdragdropHook = (api: TouchdragdropHookApi) => any;
export declare type TouchdragdropHookApi = HookApi<TouchEvent>;
export declare function touchdragdrop(options?: TouchdragdropOptions): {
    touchstart: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchmove: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchcancel: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
    touchend: (handlerApi: RecognizeableHandlerApi<TouchEvent>) => void;
};
