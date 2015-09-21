var execspawn = require('execspawn')
var concat = require('concat-stream')
var debug = require('debug')('dat-manager/exec')

module.exports = function init (cmd, cb) {
  debug('executing', cmd)
  var child = execspawn(cmd, {cwd: __dirname})

  child.stdout.pipe(process.stdout)
  var stderr
  child.stderr.pipe(concat(function (data) {
    stderr = data
  }))

  child.on('error', cb)
  child.on('close', function (code) {
    debug('command finished with code', code)
    if (code === 1) return cb(new Error(stderr))
    else cb()
  })
}
