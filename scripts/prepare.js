const { generateIndex } = require('@baleada/prepare'),
      babelify = require('./babelify')

function prepare () {
  /* Index all */
  generateIndex('src/factories', { importPath: 'lib/factories', outfile: 'factories' })

  /* Transform files */
  babelify()
  // browserify()
}

prepare()
