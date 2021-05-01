import type { RecognizeableHandlerApi } from '@baleada/logic';
import type { HookApi } from './util';
export declare type MousedragOptions = {
    minDistance?: number;
    onDown?: MousedragHook;
    onMove?: MousedragHook;
    onLeave?: MousedragHook;
    onUp?: MousedragHook;
};
export declare type MousedragHook = (api: MousedragHookApi) => any;
export declare type MousedragHookApi = HookApi<MouseEvent>;
export declare function mousedrag(options?: MousedragOptions): {
    mousedown: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
    mouseleave: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
    mouseup: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
};
