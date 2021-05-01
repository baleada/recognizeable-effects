import type { RecognizeableHandlerApi } from '@baleada/logic';
import type { HookApi } from './util';
export declare type MousedragdropOptions = {
    minDistance?: number;
    minVelocity?: number;
    onDown?: MousedragdropHook;
    onMove?: MousedragdropHook;
    onLeave?: MousedragdropHook;
    onUp?: MousedragdropHook;
};
export declare type MousedragdropHook = (api: MousedragdropHookApi) => any;
export declare type MousedragdropHookApi = HookApi<MouseEvent>;
export declare function mousedragdrop(options?: MousedragdropOptions): {
    mousedown: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
    mouseleave: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
    mouseup: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
};
