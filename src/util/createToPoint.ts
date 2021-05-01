export type ToPointType = 'mouse' | 'touch' | 'touchend'
type ToPoint = ((event: MouseEvent) => { x: number, y: number }) | ((event: TouchEvent) => { x: number, y: number })

export function createToPoint (type: ToPointType): ToPoint {
  switch (type) {
    case 'mouse':
      return toMousePoint
    case 'touch':
      return toTouchMovePoint
    case 'touchend':
      return toTouchEndPoint
  }
}

export function toMousePoint (event: MouseEvent): { x: number, y: number } {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

export function toTouchMovePoint (event: TouchEvent): { x: number, y: number } {
  return {
    x: event.touches.item(0).clientX,
    y: event.touches.item(0).clientY,
  }
}

export function toTouchEndPoint (event: TouchEvent): { x: number, y: number } {
  return {
    x: event.changedTouches.item(0).clientX,
    y: event.changedTouches.item(0).clientY,
  }
}
