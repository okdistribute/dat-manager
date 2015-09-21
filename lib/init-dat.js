var exec = require('./exec.js')
var path = require('path')
var debug = require('debug')('create-dat')
var fs = require('fs')

module.exports = function (dats, opts, cb) {
  if (!opts || !opts.name) return cb(new Error('Name required.'))

  dats.get(opts.name, function (err) {
    if (err && err.notFound) return initDat()
    else if (err) return cb(err)
    else return cb(new Error('Dat with that name already exists.'))
  })

  function initDat () {
    var cmd = path.resolve(path.join(__dirname, '../scripts/initdat ')) + opts.name
    exec(cmd, function (err) {
      if (err) return cb(err)
      var data  = {
        name: opts.name,
        user: opts.user,
        url: opts.name + '.' + opts.hostname
      }
      debug('saving dat to db', data)
      dats.put(opts.name, data, function (err) {
        if (err) return cb(err)
        return cb(null, data)
      })
    })
  }
}
