export default function naiveDeepClone (object) {
  return JSON.parse(JSON.stringify(object)) // Deep copies everything except methods
}
