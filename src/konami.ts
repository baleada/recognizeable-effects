import { keychord } from './keychord'
import type { KeychordOptions, KeychordMetadata } from './keychord'

export type KonamiOptions = KeychordOptions
export type KonamiMetadata = KeychordMetadata

export function konami (options: KonamiOptions = {}) {
  return keychord('up up down down left right left right b a', options)
}
