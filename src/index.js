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

export default [
  {
    name: 'clicks',
    factory: clicks,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    recognized,
  },
  {
    name: 'drag',
    factory: drag,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    recognized,
  },
  {
    name: 'dragdrop',
    factory: dragdrop,
    events: ['mousedown', 'mousemove', 'mouseout', 'mouseup'],
    recognized,
  },
  {
    name: 'pan',
    factory: pan,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  {
    name: 'pinch',
    factory: pinch,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  {
    name: 'press',
    factory: press,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  {
    name: 'rotate',
    factory: rotate,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  {
    name: 'swipe',
    factory: swipe,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
  {
    name: 'taps',
    factory: taps,
    events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    recognized,
  },
]
