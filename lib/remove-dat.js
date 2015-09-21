var exec = require('./exec.js')
var debug = require('debug')('remove-dat')
var fs = require('fs')

module.exports = function (dats, opts, cb) {
  if (!opts || !opts.name) return cb(new Error('Name required.'))

  dats.get(opts.name, function (err) {
    if (err) return cb(err)
    else return doRemove()
  })

  function doRemove () {
    var cmd = '../scripts/rmdat ' + opts.name
    exec(cmd, function (err) {
      if (err) return cb(err)
      debug('removing dat from db', opts.name)
      dats.del(opts.name, cb)
    })
  }
}
