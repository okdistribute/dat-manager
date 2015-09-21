var http = require('http')
var Router = require('http-hash-router')
var level = require('level')
var subdown = require('subleveldown')
var routes = require('./lib/routes.js')

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
    if (req.method === 'GET') return routes.all(req, res, opts, cb)
    else res.end('Method not allowed.')
  })

  router.set('/:name', function (req, res, opts, cb) {
    if (req.method === 'PUT')  return routes.get(req, res, opts, cb)
    else if (req.method === 'POST')  return routes.create(req, res, opts, cb)
    else if (req.method === 'DELETE') return routes.remove(req, res, opts, cb)
    return res.end('Method not allowed.')
  })

  return router
}
