export default function getGetPoint (type) {
  switch (type) {
  case 'mouse':
    return getMousePoint
    break
  case 'touch':
    return getTouchPoint
    break
  }
}

function getMousePoint (event) {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

function getTouchPoint (event) {
  return {
    x: event.touches.item(0).clientX,
    y: event.touches.item(0).clientY,
  }
}