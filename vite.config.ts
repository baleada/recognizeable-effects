import { configureable } from '@baleada/prepare'

export default new configureable.Vite()
  .includeDeps(['@baleada/logic'])
  .configure()
