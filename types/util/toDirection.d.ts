export declare type Direction = 'up' | 'upRight' | 'right' | 'downRight' | 'down' | 'downLeft' | 'left' | 'upLeft';
declare type Unit = 'degrees' | 'radians';
export declare function toDirection(angle: number, unit?: Unit): Direction;
export {};
