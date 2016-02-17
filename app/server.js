var http = require('http')
var Router = require('./router.js')
var router = Router()

module.exports = http.createServer(function (req, res) {
  router(req, res, {}, onError)

  function onError (err) {
    if (err) {
      // use your own custom error serialization.
      res.statusCode = err.statusCode || 500
      res.end(err.message)
    }
  }
})
