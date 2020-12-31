function toMousePoint (event) {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

function toTouchMovePoint (event) {
  return {
    x: event.touches.item(0).clientX,
    y: event.touches.item(0).clientY,
  }
}

function toTouchEndPoint (event) {
  return {
    x: event.changedTouches.item(0).clientX,
    y: event.changedTouches.item(0).clientY,
  }
}

const toPointByType = {
  'mouse': toMousePoint,
  'touch': toTouchMovePoint,
  'touchend': toTouchEndPoint,
}

export default function lookupToPoint (type) {
  return toPointByType[type]
}
