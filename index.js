var http = require('http')
var jsonBody = require('body/json')
var Router = require('http-hash-router')
var level = require('level')
var subdown = require('subleveldown')
var ndjson = require('ndjson')
var createDat = require('./create-dat.js')

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
      res.end(err.message);
    }
  })
  return server
}


function createDb (opts) {
  opts.DB_PATH = opts.DB_PATH || './data'
  var db = level(opts.DB_PATH, { valueEncoding: 'json' })
  db.dats = subdown(db, 'dats')
  return db
}

function createRouter () {
  var router = Router()

  router.set('/', function (req, res, opts, cb) {
    if (req.method === 'GET') return opts.db.dats.createReadStream().pipe(ndjson.serialize()).pipe(res)
    else if (req.method !== 'POST') return res.end('Method not allowed.')

    jsonBody(req, res, function (err, body) {
      if (err) return cb(err)
      createDat(opts.db.dats, {user: body.user, name: body.name}, function (err, dat) {
        if (err) return cb(err)
        res.setHeader("content-type", "application/json")
        return res.end(JSON.stringify(body))
      })
    })
  })

  return router
}
