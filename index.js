var mkdirp = require('mkdirp')
var level = require('level')
var parallel = require('run-parallel')
var debug = require('debug')('dat-manager')
var path = require('path')
var Dat = require('dat')

module.exports = Manager

function Manager (opts) {
  if (!(this instanceof Manager)) return new Manager(opts)
  if (!opts) opts = {}
  this.db = opts.db || createDb(opts)
  this.location = opts.location || path.join(process.cwd(), 'dats')
  this.running = {}
}

Manager.prototype.get = function (name, cb) {
  if (!name) return cb(new Error('Name required'))
  return this.db.get(name, cb)
}

Manager.prototype.stop = function (name, cb) {
  var self = this
  if (!name) return cb(new Error('Name required'))
  var dat = this.running[name]
  if (!dat) return cb(new Error('No dat running with that name'))
  if (dat.close) dat.close(done)
  else done()

  function done (err) {
    if (err) return cb(err)
    dat.state = 'inactive'
    self.running[name] = undefined
    self.db.put(name, dat, function (err) {
      if (err) return cb(err)
      cb(null, dat)
    })
  }
}

Manager.prototype.start = function (name, link, cb) {
  var self = this
  if (!name) return cb(new Error('Name required'))
  if (!link) return cb(new Error('Link required'))
  if (self.running[name]) return cb(new Error('Name taken'))
  var db = Dat()
  debug('downloading', link)
  var dat = {
    name: name,
    link: link,
    path: path.join(self.location, link)
  }
  db.download(link, dat.path, done)

  function done (err, swarm) {
    if (err) return cb(err)
    debug('done downloading')
    dat.close = swarm.close
    dat.state = 'active'
    dat.date = Date.now()
    self.running[name] = dat
    self.db.put(name, dat, function (err) {
      if (err) return cb(err)
      return cb(null, dat)
    })
  }
}

Manager.prototype.createValueStream = function () {
  return this.db.createValueStream()
}

Manager.prototype.delete = function (name, cb) {
  var self = this
  self.db.del(name, function (err) {
    if (err) return cb(err)
    self.running[name] = undefined
  })
}

Manager.prototype.close = function (cb) {
  var self = this
  var stream = self.db.createKeyStream()
  var funcs = []
  stream.on('data', function (name) {
    funcs.push(function (done) {
      self.stop(name, done)
    })
  })
  stream.on('end', function () {
    parallel(funcs, function (err) {
      if (err) return cb(err)
      return cb()
    })
  })
}

function createDb (opts) {
  opts.DB_PATH = opts.DB_PATH || './data'
  mkdirp.sync(opts.DB_PATH)
  return level(opts.DB_PATH)
}
