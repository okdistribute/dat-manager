var execspawn = require('execspawn')
var concat = require('concat-stream')

module.exports = function init (opts, cb) {
  if (!opts || !opts.name) return cb(new Error('Name required.'))

  var cmd = './createdat ' + opts.name
  var child = execspawn(cmd)

  child.stdout.pipe(process.stdout)
  var stderr
  child.stderr.pipe(concat(function (data) {
    stderr = data
  })

  child.on('error', cb)
  child.on('end', function (code) {
    if (code === 1) return cb(new Error(stderr))
    else cb()
  })
}
