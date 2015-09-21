var initDat = require('./init-dat.js')
var debug = require('debug')('create-dat')
var fs = require('fs')

var config = JSON.parse(fs.readFileSync('config.json').toString())

module.exports = function createDat (dats, opts, cb) {
  dats.get(opts.name, function (err) {
    if (err) {
      if (err.notFound) return initDat(opts, function (err, path) {
        if (err) return cb(err)
        var data  = {
          name: opts.name,
          user: opts.user,
          url: genUrl(opts.name),
        }
        debug('saving dat to db', data)
        dats.put(opts.name, JSON.stringify(data), cb)
      })
      return cb(err)
    }
    return cb(new Error('Dat with that name already exists.'))
  })
}

function genUrl (name) {
  return name + '.' + config.host
}
