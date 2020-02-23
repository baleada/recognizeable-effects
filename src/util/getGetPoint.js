function getMousePoint (event) {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

function getTouchMovePoint (event) {
  return {
    x: event.touches.item(0).clientX,
    y: event.touches.item(0).clientY,
  }
}

function getTouchEndPoint (event) {
  return {
    x: event.changedTouches.item(0).clientX,
    y: event.changedTouches.item(0).clientY,
  }
}

const getGetPointDictionary = {
  'mouse': getMousePoint,
  'touch': getTouchMovePoint,
  'touchend': getTouchEndPoint,
}

export default function getGetPoint (type) {
  return getGetPointDictionary[type]
}
