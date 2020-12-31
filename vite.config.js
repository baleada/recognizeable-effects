import { configureable } from '@baleada/prepare'
import { resolve } from 'path'

export default configureable('vite')
  .alias({
    '/@src/': `/src`,
  })
  .koa(configureable => 
    configureable
      .virtual.index(
        resolve('', 'src/index.js'),
        { test: ({ id }) => id.includes('handler-getters') }
      )
      .virtual.index('src/util')
      .configure()
  )
  .includeDeps(['@baleada/logic'])
  .configure()
