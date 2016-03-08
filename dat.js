var Swarm = require('discovery-swarm')
var Hyperdrive = require('hyperdrive')
var debug = require('debug')('dat-manager')
var mkdirp = require('mkdirp')
var path = require('path')
var homeDir = require('os-homedir')
var level = require('level-party')
var each = require('stream-each')
var pump = require('pump')
var through = require('through2')
var walker = require('folder-walker')

var DAT_DOMAIN = 'dat.local'
var DEFAULT_DISCOVERY = [
  'discovery1.publicbits.org',
  'discovery2.publicbits.org'
]
var DEFAULT_BOOTSTRAP = [
  'bootstrap1.publicbits.org:6881',
  'bootstrap2.publicbits.org:6881',
  'bootstrap3.publicbits.org:6881',
  'bootstrap4.publicbits.org:6881'
]

module.exports = Dat

function Dat (opts) {
  if (!(this instanceof Dat)) return new Dat(opts)
  var self = this
  var dbDir = path.join(opts.home || homeDir(), '.datmanager', 'db')
  mkdirp.sync(dbDir)
  self.drive = Hyperdrive(opts.db || level(dbDir))
  self.swarm = Swarm({
    id: self.drive.core.id,
    dns: {server: DEFAULT_DISCOVERY, domain: DAT_DOMAIN},
    dht: {bootstrap: DEFAULT_BOOTSTRAP},
    stream: function () {
      return self.drive.createPeerStream()
    }
  })
  self.swarm.listen(0)
}

Dat.prototype.add = function (dirs, cb) {
  var self = this
  var archive = this.drive.add('.')
  var stream = walker(dirs, {filter: function (data) {
    if (path.basename(data) === '.dat') return false
    return true
  }})

  each(stream, function (data, next) {
    var item = {
      name: data.relname,
      path: path.resolve(data.filepath),
      mode: data.stat.mode,
      uid: data.stat.uid,
      gid: data.stat.gid,
      mtime: data.stat.mtime.getTime(),
      ctime: data.stat.ctime.getTime(),
      size: data.stat.size
    }
    archive.appendFile(item.path, item.name, next)
  }, function (err) {
    if (err) return cb(err)
    archive.finalize(function (err) {
      if (err) return cb(err)
      var link = archive.id.toString('hex')
      debug('done', link, archive.stats)
      self.swarm.join(link)
      cb(null, link, archive.stats)
    })
  })
}

Dat.prototype.download = function (link, location, cb) {
  var self = this
  link = link.replace('dat://', '').replace('dat:', '')
  debug('joining', link)
  self.swarm.join(new Buffer(link, 'hex'))
  var archive = self.drive.get(link, location)
  var downloadEntry = through.obj(function (entry, encoding, next) {
    var dl = archive.download(entry, function (err) {
      if (err) return cb(err)
      next(null)
    })
    debug('entry', entry)

    dl.on('ready', function () {
      debug('download started', entry.name, dl)
    })

    dl.on('end', function () {
      debug('done', entry.size)
    })
  })

  pump(archive.createEntryStream(), downloadEntry, function (err) {
    if (err) return cb(err)
    cb(null, archive.stats)
  })
}

Dat.prototype.close = function (cb) {
  this.drive.core.db.close()
  this.swarm.destroy(cb)
}
