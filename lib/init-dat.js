var exec = require('./exec.js')
var debug = require('debug')('init-dat')

module.exports = function delete (opts, cb) {
  if (!opts || !opts.name) return cb(new Error('Name required.'))
  var cmd = './initdat' + opts.name
  exec(cmd, opts, cb)
}
