#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var getport = require('getport')
var http = require('http')

var router = require('./router.js')

if (process.env.PORT && !args.port) args.port = process.env.PORT
if (args.port) return listen (args.port, config)
getport(5000, function (err, port) {
  if (err) throw err
  listen(port, config)
})

function listen (port) {
  var server = http.createServer(function (req, res) {
    try {
      router(req, res, opts, onError)
    } catch (err) {
      onError(err)
    }

    function onError (err) {
      res.statusCode = err.statusCode || 500
      console.trace(err)
      res.end(err.message)
    }
  })
  server.listen(port, function (err) {
    if (err) throw err
    console.log('Listening on port', port)
  })
}
