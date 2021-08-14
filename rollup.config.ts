import { configureable } from '@baleada/prepare'

const external = [
        '@baleada/logic',
        'lazy-collections'
      ],
      esm = new configureable.Rollup()
        .delete({ targets: 'lib/*' })
        .input('src/index.ts')
        .external(external)
        .typescript()
        .resolve()
        .esm({ file: 'lib/index.js', target: 'browser' })
        .analyzer()
        .configure(),
      dts = new configureable.Rollup()
        .input('types/index.d.ts')
        .external(external)
        .output({ file: 'lib/index.d.ts', format: 'esm' })
        .dts()
        .configure()

export default [
  esm,
  dts,
]
