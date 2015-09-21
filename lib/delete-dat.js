var exec = require('./exec.js')
var debug = require('debug')('delete-dat')

module.exports = function delete (opts, cb) {
  if (!opts || !opts.name) return cb(new Error('Name required.'))
  var cmd = './deletedat' + opts.name
  exec(cmd, opts, cb)
}
