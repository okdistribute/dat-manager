var mkdirp = require('mkdirp')
var through = require('through2')
var collect = require('collect-stream')
var extend = require('extend')
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
  this.location = opts.location || path.resolve('dats')
  this.dat = Dat()
  this.init(function (err) {
    if (err) throw err
  })
}

Manager.prototype.get = function (key, cb) {
  if (!key) return cb(new Error('key required'))
  return this.db.get(key, cb)
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
  if (data.key !== key) {
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
    dat.state = 'inactive'
    debug('stopping', dat)
    self.dat.swarm.leave(dat.link)
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
  self.dat.addFiles(location, function (err, link) {
    if (err) return cb(err)
    debug('finished adding files', link)
    self.dat.joinTcpSwarm({link: link}, function (_err, swarm) {
      if (err) return cb(err)
      debug('joined swarm')
      var dat = {
        state: 'active',
        link: link,
        date: Date.now(),
        location: location
      }
      self.db.put(key, dat, function (err) {
        if (err) return cb(err)
        return cb(null, {key: key, value: dat})
      })
    })
  })
}

Manager.prototype.start = function (key, opts, cb) {
  var self = this
  if ((typeof opts) === 'function') return self.start(key, {}, opts)
  if (!opts) opts = {}
  if (!key) return cb(new Error('key required'))
  var validated = key.match(/^[a-zA-Z0-9_ ]*$/)
  if (!validated) return cb(new Error('key must contain no special characters except underscores. got ' + key))
  debug('starting', key)
  self.db.get(key, function (err, dat) {
    var location = opts.location || (dat && dat.location) || path.join(self.location, opts.link.replace('dat://', ''))
    if (err) {
      if (err.notFound) return self.download(opts.link, location, done)
      else return cb(err)
    }
    if (opts.link) return self.download(opts.link, location, done)
    else return self.download(dat.link, location, done)

    function done () {
      var dat = {
        state: 'active',
        link: opts.link,
        date: Date.now(),
        location: location
      }
      self.db.put(key, dat, function (err) {
        if (err) return cb(err)
        return cb(null, {key: key, value: dat})
      })
    }
  })
}

Manager.prototype.download = function (link, location, cb) {
  var self = this
  debug('downloading', link, 'to', location)
  self.dat.download(link, location, function (err, swarm) {
    if (err) return cb(err)
    debug('done downloading')
    cb(null)
  })
}

Manager.prototype.delete = function (key, cb) {
  var self = this
  debug('deleting', key)
  self.db.get(key, function (err, dat) {
    if (err) return cb(err)
    self.dat.swarm.remove(dat.link)
    self.db.del(key, function (err) {
      if (err) return cb(err)
      debug('done')
      cb(null)
    })
  })
}

Manager.prototype.list = function (cb) {
  var readStream = this.db.createReadStream()
  var metadata = through.obj(function (data, enc, next) {
    next(null, data)
  })
  var stream = readStream.pipe(metadata)
  collect(stream, cb)
}

Manager.prototype.close = function (cb) {
  this.db.close()
  this.dat.close(cb)
}

Manager.prototype.init = function (cb) {
  var self = this
  var stream = self.db.createReadStream()
  var funcs = []

  stream.on('data', function (dat) {
    funcs.push(function (done) {
      if (dat.value.state === 'active') self.start(dat.key, done)
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
