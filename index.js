var mkdirp = require('mkdirp')
var level = require('level')
var debug = require('debug')('dat-manager')
var path = require('path')
var Dat = require('dat')
var subdown = require('subleveldown')

module.exports = Manager

function Manager (opts) {
  if (!(this instanceof Manager)) return new Manager(opts)
  if (!opts) opts = {}
  this.db = opts.db || createDb(opts)
  this.DOWNLOAD_PATH = path.join(process.cwd(), 'dats')
  this.running = {}
}

Manager.prototype.get = function (name, cb) {
}

Manager.prototype.start = function (name, link, cb) {
  var self = this
  if (!name) return cb(new Error('Name required'))
  if (self.running[name]) return cb(new Error('Name taken'))
  var db = Dat()
  debug('downloading', link)
  var dat = {
    name: name,
    link: link,
    path: path.join(self.DOWNLOAD_PATH, link)
  }
  db.download(link, dat.path, done)

  function done (err, swarm) {
    if (err) return cb(err)
    debug('done downloading')
    dat.close = swarm.close
    dat.state = 'active'
    dat.date = Date.now()
    self.running[name] = dat
    if (cb) cb(null, dat)
  }
}

Manager.prototype.list = function (name, cb) {
}

Manager.prototype.delete = function (name, cb) {
}

// STUBS BELOW:

function restart (dat, cb) {
  debug('restarting', dat)
  stop(dat, function (err, dat) {
    debug('done', arguments)
    if (err) throw err
    start(dat, cb)
  })
}

function start (dat, cb) {
  if (RUNNING[dat.path]) return restart(dat, cb)
  config.read()
  dat.state = 'loading'
  config.update(dat)
  debug('starting', dat)
  var db = Dat()
  if (dat.link) return db.download(dat.link, dat.path, done)
  db.addFiles(dat.path, function (err, link) {
    if (err) return cb(err)
    db.joinTcpSwarm(link, done)
  })

  function done (err, swarm) {
    debug('done', arguments)
    if (err) return cb(err)
    RUNNING[dat.path] = swarm.close
    dat.state = 'active'
    dat.link = swarm.link
    dat.date = Date.now()
    config.update(dat)
    if (cb) cb(null, dat)
  }
}

function stop (dat, cb) {
  config.read()
  var close = RUNNING[dat.path]
  debug('stopping', dat)
  if (close) close(done)
  else done()

  function done (err) {
    debug('done', err)
    if (err) return cb(err)
    RUNNING[dat.path] = undefined
    dat.state = 'inactive'
    config.update(dat)
    if (cb) cb(null, dat)
  }
}

function createDb (opts) {
  opts.DB_PATH = opts.DB_PATH || './data'
  mkdirp.sync(opts.DB_PATH)
  var db = level(opts.DB_PATH)
  db.dats = subdown(db, 'dats', {valueEncoding: 'json'})
  return db
}
