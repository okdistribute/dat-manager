#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var path = require('path')
var getport = require('getport')
var manager = require('./')

var configPath = args.config || path.join(__dirname, 'config.json')
var config = JSON.parse(fs.readFileSync(configPath).toString())

for (var v in config) {
  if (process.env.hasOwnProperty(v)) {
    config[v] = process.env[v]
  }
}

if (config.port) return manager(config)

getport(5000, function (err, port) {
  if (err) throw err
  var server = manager(config)
  server.listen(port, function (err) {
    if (err) throw err
    console.log('Listening on port', port)
  })
})
