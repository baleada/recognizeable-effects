import type { RecognizeableEffectApi, RecognizeableStatus, ListenableSupportedType, ListenEffectParam } from '@baleada/logic'

export type HookApi<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
    sequenceItem: ListenEffectParam<Type>,
    status: RecognizeableStatus,
    metadata: Metadata,
    sequence: ListenEffectParam<Type>[]
  }

export function toHookApi<Type extends ListenableSupportedType, Metadata extends Record<any, any>> ({ sequenceItem, getSequence, getStatus, getMetadata }: RecognizeableEffectApi<Type, Metadata>): HookApi<Type, Metadata> {
  return {
    sequenceItem,
    sequence: getSequence(),
    status: getStatus(),
    metadata: getMetadata()
  }
}
