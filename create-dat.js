var initDat = require('./init-dat.js')
var config = require

function createDat (dats, opts, cb) {
  dats.get(opts.name, function (err) {
    if (err) {
      if (err.notFound) return initDat(opts, function (err, path) {
        if (err) return cb(err)
        var data  = {
          name: opts.generateName(opts.name),
          path: path
        }
        dats.put(opts.name, JSON.stringify(body), cb)
      })
      return cb(err)
    }
    return cb(new Error('Dat with that name already exists.'))
  })
}
