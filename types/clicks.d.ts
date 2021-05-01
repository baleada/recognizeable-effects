import type { HookApi } from './util';
import type { RecognizeableHandlerApi } from '@baleada/logic';
export declare type ClicksOptions = {
    minClicks?: number;
    maxInterval?: number;
    maxDistance?: number;
    onDown?: ClicksHook;
    onMove?: ClicksHook;
    onLeave?: ClicksHook;
    onUp?: ClicksHook;
};
export declare type ClicksHook = (api: ClicksHookApi) => any;
export declare type ClicksHookApi = HookApi<MouseEvent>;
export declare function clicks(options?: ClicksOptions): {
    mousedown: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
    mouseleave: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
    mouseup: (handlerApi: RecognizeableHandlerApi<MouseEvent>) => void;
};
