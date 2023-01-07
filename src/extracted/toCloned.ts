type Cloneable = {
  [key: string]: string | number | boolean | Cloneable,
}

export function toCloned<T extends Cloneable> (object: T): T {
  const cloned: T = {} as T

  for (const key in object) {
    // @ts-expect-error
    cloned[key] = typeof object[key] === 'string' || typeof object[key] === 'number' || typeof object[key] === 'boolean'
      ? object[key]
      // @ts-expect-error
      : toCloned(object[key])
  }

  return cloned
}
