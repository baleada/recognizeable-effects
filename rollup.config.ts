import { configureable } from '@baleada/prepare'

const esm = new configureable.Rollup()
        .delete({ targets: 'lib/*' })
        .input('src/index.ts')
        .typescript()
        .resolve()
        .esm({ file: 'lib/index.js', target: 'browser' })
        .analyzer()
        .configure(),
      dts = new configureable.Rollup()
        .input('types/index.d.ts')
        .output({ file: 'lib/index.d.ts', format: 'esm' })
        .dts()
        .configure()

export default [
  esm,
  dts,
]
