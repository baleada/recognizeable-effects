import clicksFactory from './factories/clicks'
import dragFactory from './factories/drag'
import dragdropFactory from './factories/dragdrop'
import panFactory from './factories/pan'
import pinchFactory from './factories/pinch'
import pressFactory from './factories/press'
import rotateFactory from './factories/rotate'
import swipeFactory from './factories/swipe'
import tapsFactory from './factories/taps'

function recognized (event, object) {
  return object.handle(event) === 'recognized'
}

export const clicks = {
  factory: clicksFactory,
  events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
  recognized,
}

export const drag = {
  factory: dragFactory,
  events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
  recognized,
}

export const dragdrop = {
  factory: dragdropFactory,
  events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
  recognized,
}

export const pan = {
  factory: panFactory,
  events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
  recognized,
}

export const pinch = {
  factory: pinchFactory,
  events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
  recognized,
}

export const press = {
  factory: pressFactory,
  events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
  recognized,
}

export const rotate = {
  factory: rotateFactory,
  events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
  recognized,
}

export const swipe = {
  factory: swipeFactory,
  events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
  recognized,
}

export const taps = {
  factory: tapsFactory,
  events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
  recognized,
}
