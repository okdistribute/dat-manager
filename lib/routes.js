var pump = require('pump')
var path = require('path')
var url = require('url')
var debug = require('debug')
var formatData = require('format-data')
var jsonBody = require('body/json')
var dat = require('dat')

module.exports = routes

function routes () {}

routes.get = function (req, res, opts, cb) {
  opts.db.dats.get(opts.params.name, function (err, dat) {
    if (err) return cb(err)
    res.setHeader('content-type', 'application/json')
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
    debug('creating', opts)
    var data = {
      datPath: body.path,
      name: opts.params.name || path.basename(body.path),
      active: true
    }
    var db = dat(data.datPath)
    db.share(function (err, link, port, close) {
      if (err) return cb(err)

      opts.db.dats.put(data.name, data, function (err) {
        if (err) return cb(err)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data))
      })

      function status () {
        opts.db.dats.get(data.name, function (err, data) {
          if (err) return cb(err)
          if (!data.active) close()
        })
      }
      setInterval(status, 2000)
    })
  })
}

routes.remove = function (req, res, opts, cb) {
  opts.db.dats.get(opts.params.name, function (err, data) {
    if (err) return cb(err)
    data.active = false
    opts.db.dats.put(opts.params.name, data, function (err) {
      if (err) return cb(err)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({stopped: true}))
    })
  })
}
