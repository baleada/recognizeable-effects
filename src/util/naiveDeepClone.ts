export function naiveDeepClone (object: Record<any, any>): Record<any, any> {
  return JSON.parse(JSON.stringify(object)) // Deep copies everything except methods
}
