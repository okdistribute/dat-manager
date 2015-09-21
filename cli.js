#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var path = require('path')
var getport = require('getport')
var fs = require('fs')
var manager = require('./')

var configPath = args.config || path.join(__dirname, 'config.json')
var config = JSON.parse(fs.readFileSync(configPath).toString())

if (args.port) config.PORT = args.port
if (args.hostname) config.HOSTNAME = args.hostname

for (var v in config) {
  if (process.env.hasOwnProperty(v)) {
    config[v] = process.env[v]
  }
}

if (config.PORT) return listen (config.PORT, config)
getport(5000, function (err, port) {
  if (err) throw err
  listen(port, config)
})


function listen (port, config) {
  var server = manager(config)
  server.listen(port, function (err) {
    if (err) throw err
    console.log('Listening on port', port)
  })
}
