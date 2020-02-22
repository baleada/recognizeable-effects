const { generateIndex } = require('@baleada/prepare'),
      babelify = require('./babelify')

function prepare () {
  /* Index all */
  generateIndex('src/handler-getters', { importPath: 'lib/handler-getters', outfile: 'handler-getters' })
  generateIndex('src/util')

  /* Transform files */
  babelify()
  // browserify()
}

prepare()
