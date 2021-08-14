import { keychord } from './keychord'
import type {
  KeychordTypes,
  KeychordMetadata,
  KeychordOptions,
  KeychordHook,
  KeychordHookApi
} from './keychord'
import { RecognizeableOptions } from '@baleada/logic'

export type KonamiTypes = KeychordTypes
export type KonamiMetadata = KeychordMetadata
export type KonamiOptions = KeychordOptions
export type KonamiHook = KeychordHook
export type KonamiHookApi = KeychordHookApi

export function konami (options: KonamiOptions = {}): RecognizeableOptions<KonamiTypes, KonamiMetadata>['effects'] {
  return keychord('up up down down left right left right b a', options)
}
