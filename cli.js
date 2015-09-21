#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var manager = require('./')
var getport = require('getport')

if (args.port) return manager(args.port)

getport(5000, function (err, port) {
  if (err) throw err
  var server = manager()
  server.listen(port, function (err) {
    if (err) throw err
    console.log('Listening on port', port)
  })
})
