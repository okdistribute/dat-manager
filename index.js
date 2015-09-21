var http = require('http')
var url = require('url')
var formatData = require('format-data')
var jsonBody = require('body/json')
var Router = require('http-hash-router')
var pump = require('pump')
var level = require('level')
var subdown = require('subleveldown')
var ndjson = require('ndjson')

var initDat = require('./lib/init-dat.js')
var removeDat = require('./lib/remove-dat.js')

module.exports = function manager (opts) {
  if (!opts) return manager({})
  opts.db = opts.db || createDb(opts)

  var router = createRouter()
  var server = http.createServer(function (req, res) {
    try {
      router(req, res, opts, onError)
    } catch (err) {
      onError(err)
    }

    function onError (err) {
      res.statusCode = err.statusCode || 500;
      console.trace(err)
      res.end(err.message);
    }
  })
  return server
}


function createDb (opts) {
  opts.DB_PATH = opts.DB_PATH || './data'
  var db = level(opts.DB_PATH)
  db.dats = subdown(db, 'dats', { valueEncoding: 'json'})
  return db
}

function createRouter () {
  var router = Router()

  router.set('/', function (req, res, opts, cb) {
    if (req.method === 'GET') return all(req, res, opts, cb)
    else res.end('Method not allowed.')
  })

  router.set('/:name', function (req, res, opts, cb) {
    if (req.method === 'PUT')  return get(req, res, opts, cb)
    else if (req.method === 'POST')  return create(req, res, opts, cb)
    else if (req.method === 'DELETE') return remove(req, res, opts, cb)
    return res.end('Method not allowed.')
  })

  return router
}

function get (req, res, opts, cb) {
  opts.db.dats.get(opts.params.name, function (err, dat) {
    if (err) return cb(err)
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify(dat))
  })
}

function all (req, res, opts, cb) {
  var parsed = url.parse(req.url, true)
  var query = parsed.query
  if (!query.format) query.format = 'ndjson'
  pump(opts.db.dats.createValueStream(), formatData(query.format), res, function (err) {
    if (err) return cb(err)
  })
}

function create (req, res, opts, cb) {
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

function remove (req, res, opts, cb) {
  removeDat(opts.db.dats, {name: opts.params.name}, function (err) {
    if (err) return cb(err)
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({deleted: true}))
  })
}
