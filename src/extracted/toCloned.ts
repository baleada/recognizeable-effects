type Cloneable = {
  [key: string]: string | number | boolean | Cloneable,
}

export function toCloned<T extends Cloneable> (object: T): T {
  const toClonedd: T = {} as T

  for (const key in object) {
    // @ts-ignore
    toClonedd[key] = typeof object[key] === 'string' || typeof object[key] === 'number' || typeof object[key] === 'boolean'
      ? object[key]
      // @ts-ignore
      : toCloned(object[key])
  }

  return toClonedd
}
