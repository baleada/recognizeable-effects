import { configureable } from '@baleada/prepare'

export default [
  configureable('rollup')
    .delete({ targets: 'lib/*' })
    .input('src/index.js')
    .resolve()
    .virtual.index(
      'src/index.js',
      { test: ({ id }) => id.includes('handler-getters') }
    )
    .virtual.index('src/util')
    .esm({ file: 'lib/index.js', target: 'browser' })
    .analyze()
    .configure()
]
