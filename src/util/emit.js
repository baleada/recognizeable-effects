export default function(emitter, object) {
  if (typeof emitter === 'function') {
    emitter(object)
  }
}
