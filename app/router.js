var Router = require('http-hash-router')
var fs = require('fs')
var path = require('path')
var Manager = require('../')
var url = require('url')

module.exports = createRouter

function createRouter () {
  var router = Router()
  var manager = Manager()

  router.set('/static/*', function (req, res, opts, cb) {
    res.end(fs.readFileSync(path.join(__dirname, 'static', opts.splat)).toString())
  })

  router.set('/', function (req, res, opts, cb) {
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')).toString())
  })

  router.set('/dats', function (req, res, opts, cb) {
    if (req.method === 'GET') {
      manager.list(function (err, dats) {
        if (err) return cb(err)
        res.end(JSON.stringify({'dats': dats}))
      })
    }
    else res.end('Method not allowed.')
  })

  router.set('/dats/:name', function (req, res, opts, cb) {
    var name = opts.params.name
    if (req.method === 'GET') return manager.get(name, cb)
    else if (req.method === 'DELETE') return manager.remove(name, cb)
    return cb(new Error('Method not allowed.'))
  })

  router.set('/dats/:name/start', function (req, res, opts, cb) {
    if (req.method !== 'GET') return cb(new Error('Method not allowed.'))
    var name = opts.params.name
    var link = url.parse(req.url, true).query.link
    manager.start(name, {link: link}, function (err, data) {
      if (err) return cb(err)
      res.end(JSON.stringify(data))
    })
  })

  router.set('/dats/:name/stop', function (req, res, opts, cb) {
    if (req.method !== 'GET') return cb(new Error('Method not allowed.'))
    manager.stop(opts.params.name, function (err, data) {
      if (err) return cb(err)
      res.end(JSON.stringify(data))
    })
  })

  return router
}
