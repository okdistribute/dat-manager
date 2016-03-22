var mkdirp = require('mkdirp')
var collect = require('collect-stream')
var extend = require('extend')
var level = require('level')
var parallel = require('run-parallel')
var through = require('through2')
var pump = require('pump')
var debug = require('debug')('dat-manager')
var path = require('path')
var Dat = require('./dat.js')

module.exports = Manager

function Manager (opts) {
  if (!(this instanceof Manager)) return new Manager(opts)
  if (!opts) opts = {}
  this.db = opts.db || createDb(opts)
  this.location = opts.location || path.resolve('dats')
  this.dat = Dat({db: opts.datdb})
  if (opts.start !== false) {
    this.init(function (err) {
      if (err) throw err
    })
  }
}

Manager.prototype.get = function (key, cb) {
  if (!key) return cb(new Error('key required'))
  this.db.get(key, function (err, dat) {
    if (err) return cb(err)
    return cb(null, {key: key, value: dat})
  })
}

Manager.prototype.rename = function (key, newkey, cb) {
  var self = this
  self.db.get(key, function (err, data) {
    if (err) return cb(err)
    self.db.put(newkey, data, function (err, data) {
      if (err) return cb(err)
      self.db.del(key, data, cb)
    })
  })
}

Manager.prototype.update = function (key, data, cb) {
  var self = this
  if (!key) return cb(new Error('key required'))
  if (data.key && (data.key !== key)) {
    self.rename(key, data.key, function (err) {
      if (err) return cb(err)
      self.update(data.key, data, cb)
    })
  } else {
    self.db.get(key, function (err, oldData) {
      if (err) return cb(err)
      self.db.put(key, extend(oldData, data), cb)
    })
  }
}

Manager.prototype.stop = function (key, cb) {
  var self = this
  if (!key) return cb(new Error('key required'))
  self.db.get(key, function (err, dat) {
    if (err) return cb(err)
    debug('stopping', dat)
    self.dat.leave(dat.link)
    dat.state = 'inactive'
    dat.swarm = false
    self.db.put(key, dat, function (err) {
      if (err) return cb(err)
      debug('done', dat)
      cb(null, {key: key, value: dat})
    })
  })
}

Manager.prototype.share = function (key, location, cb) {
  var self = this
  debug('adding files for', key, 'from', location)
  self.dat.add(location, function (err, link, stats) {
    if (err) return cb(err)
    debug('stats', stats)
    var dat = {
      state: 'active',
      swarm: true,
      link: link,
      date: Date.now(),
      location: location,
      stats: stats
    }
    if (!key) key = link
    self.db.put(key, dat, function (err) {
      if (err) return cb(err)
      return cb(null, {key: key, value: dat})
    })
  })
}

Manager.prototype.start = function (key, opts, cb) {
  var self = this
  debug('starting', key)
  if ((typeof opts) === 'function') return self.start(key, {}, opts)
  if (!opts) opts = {}
  if (!key) return cb(new Error('key required'))
  key = key.replace('dat://', '').replace('dat:', '')
  self.db.get(key, function (err, dat) {
    var location = opts.location || dat && dat.location || path.join(self.location, opts.link.replace('dat://', ''))
    if (err) {
      if (!err.notFound) return cb(err)
      dat = {
        location: location
      }
    }
    dat.date = Date.now()
    dat.state = 'active'
    dat.swarm = true
    if (opts.link) dat.link = opts.link
    debug('downloading', dat.link, dat.location)
    self.dat.download(dat.link, dat.location, function (err, stats) {
      if (err) return cb(err)
      dat.stats = stats
      debug('updating', dat)
      self.db.put(key, dat, function (err) {
        if (err) return cb(err)
        return cb(null, {key: key, value: dat})
      })
    })
  })
}

Manager.prototype.delete = function (key, cb) {
  var self = this
  debug('deleting', key)
  self.db.get(key, function (err, dat) {
    if (err) return cb(err)
    self.dat.leave(dat.link)
    self.db.del(key, function (err) {
      if (err) return cb(err)
      debug('done')
      cb(null)
    })
  })
}

Manager.prototype.list = function (cb) {
  collect(this.db.createReadStream(), cb)
}

Manager.prototype.close = function (cb) {
  var self = this
  var stream = this.db.createReadStream()
  pump(stream, through.obj(function (data, enc, next) {
    data.swarm = false
    next(null, data)
  }), function (err) {
    if (err) return cb(err)
    self.db.close()
    self.dat.close(cb)
  })
}

Manager.prototype.init = function (cb) {
  var self = this
  var stream = self.db.createReadStream()
  var funcs = []

  stream.on('data', function (dat) {
    funcs.push(function (done) {
      if (dat.value.state === 'active' && !dat.value.swarm) self.start(dat.key, done)
      else done()
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
  opts.DB_PATH = opts.DB_PATH || path.resolve('data')
  mkdirp.sync(opts.DB_PATH)
  return level(opts.DB_PATH, { valueEncoding: 'json' })
}
