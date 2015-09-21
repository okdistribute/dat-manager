var fs = require('fs')
var path = require('path')
var debug = require('debug')('remove-dat')
var exec = require('./exec.js')

module.exports = function (dats, opts, cb) {
  if (!opts || !opts.name) return cb(new Error('Name required.'))

  dats.get(opts.name, function (err) {
    if (err) return cb(err)
    else return doRemove()
  })

  function doRemove () {
    var cmd = path.resolve(path.join(__dirname, '../scripts/rmdat ')) + opts.name
    exec(cmd, function (err) {
      if (err) return cb(err)
      debug('removing dat from db', opts.name)
      dats.del(opts.name, cb)
    })
  }
}
