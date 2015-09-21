var pump = require('pump')
var url = require('url')
var formatData = require('format-data')
var jsonBody = require('body/json')

var initDat = require('./lib/init-dat.js')
var removeDat = require('./lib/remove-dat.js')

module.exports = function routes () {}

routes.get = function (req, res, opts, cb) {
  opts.db.dats.get(opts.params.name, function (err, dat) {
    if (err) return cb(err)
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify(dat))
  })
}

routes.all = function (req, res, opts, cb) {
  var parsed = url.parse(req.url, true)
  var query = parsed.query
  if (!query.format) query.format = 'ndjson'
  pump(opts.db.dats.createValueStream(), formatData(query.format), res, function (err) {
    if (err) return cb(err)
  })
}

routes.create = function (req, res, opts, cb) {
  jsonBody(req, res, function (err, body) {
    if (err) return cb(err)
    var data = {
      user: body.user,
      hostname: opts.hostname,
      name: opts.params.name
    }
    initDat(opts.db.dats, data, function (err, dat) {
      if (err) return cb(err)
      res.setHeader("content-type", "application/json")
      res.end(JSON.stringify(dat))
    })
  })
}

routes.remove = function (req, res, opts, cb) {
  removeDat(opts.db.dats, {name: opts.params.name}, function (err) {
    if (err) return cb(err)
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({deleted: true}))
  })
}
