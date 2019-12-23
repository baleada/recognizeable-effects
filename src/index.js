import clicks from './factories/clicks'
import drag from './factories/drag'
import dragdrop from './factories/dragdrop'
import pan from './factories/pan'
import pinch from './factories/pinch'
import press from './factories/press'
import rotate from './factories/rotate'
import swipe from './factories/swipe'
import taps from './factories/taps'

function recognized (event, object) {
  return object.handle(event) === 'recognized'
}

export default {
  clicks: {
    factory: clicks,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    recognized,
  },
  drag: {
    factory: drag,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    recognized,
  },
  dragdrop: {
    factory: dragdrop,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    recognized,
  },
  pan: {
    factory: pan,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  pinch: {
    factory: pinch,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  press: {
    factory: press,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  rotate: {
    factory: rotate,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  swipe: {
    factory: swipe,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  taps: {
    factory: taps,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
}
