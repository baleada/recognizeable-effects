export declare type ToPointType = 'mouse' | 'touch' | 'touchend';
declare type ToPoint = ((event: MouseEvent) => {
    x: number;
    y: number;
}) | ((event: TouchEvent) => {
    x: number;
    y: number;
});
export declare function createToPoint(type: ToPointType): ToPoint;
export declare function toMousePoint(event: MouseEvent): {
    x: number;
    y: number;
};
export declare function toTouchMovePoint(event: TouchEvent): {
    x: number;
    y: number;
};
export declare function toTouchEndPoint(event: TouchEvent): {
    x: number;
    y: number;
};
export {};
