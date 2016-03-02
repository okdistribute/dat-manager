var Swarm = require('discovery-swarm')
var Hyperdrive = require('hyperdrive')
var level = require('level')
var path = require('path')
var each = require('stream-each')
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
  self.drive = Hyperdrive(opts.db || level('./data'))
  self.swarm = Swarm({
    id: self.drive.core.id,
    dns: {server: DEFAULT_DISCOVERY, domain: DAT_DOMAIN},
    dht: {bootstrap: DEFAULT_BOOTSTRAP},
    stream: function () {
      return self.drive.createPeerStream()
    }
  })
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
  })

  stream.on('error', cb)
  stream.on('end', function () {
    archive.finalize(function (err) {
      if (err) return cb(err)
      var link = archive.id.toString('hex')
      self.swarm.join(link)
      cb(null, link, archive.stats)
    })
  })
}

Dat.prototype.download = function (link, location, cb) {
  var self = this
  self.swarm.join(link)
  var archive = self.drive.get(link, location)
  console.log('downloading', link, location)
  var metadata = archive.createEntryStream()
  var stats = {
    size: 0
  }
  metadata.on('data', function (entry) {
    var dl = archive.download(entry)
    stats.size += entry.size
    console.log('entry', entry)

    dl.on('ready', function () {
      console.log('download started', entry.name, dl)
    })

    dl.on('end', function () {
      console.log('done', entry.size)
    })
  })
  metadata.on('error', cb)
  metadata.on('end', function () {
    cb(null, stats)
  })

  self.swarm.listen()
}
