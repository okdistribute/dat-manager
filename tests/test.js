var Manager = require('../')
var Dat = require('dat')
var LocalDat = require('../dat')
var path = require('path')
var os = require('os')
var memdb = require('memdb')
var test = require('tape')

var location = path.join(__dirname, 'manager_test')

test('basic manager config options', function (t) {
  var manager = Manager({
    location: location,
    datdb: memdb(),
    db: memdb({ valueEncoding: 'json' })
  })
  manager.list(function (err, data) {
    t.ifError(err)
    t.equal(data.length, 0, 'no data')
    manager.close()
    t.end()
  })
})

test('manager start and stop', function (t) {
  var manager = Manager({
    location: location,
    datdb: memdb(),
    db: memdb({ valueEncoding: 'json' })
  })
  var db = Dat()
  db.addFiles(path.join(__dirname, 'fixtures'), function (err, link) {
    t.ifError(err)
    db.joinTcpSwarm(link, function (err) {
      t.ifError(err)
      manager.start('mydat', {link: link}, function (err, stats) {
        t.ifError(err)
        manager.list(function (err, data) {
          t.ifError(err)
          t.same(data[0].key, 'mydat')
          t.same(data[0].value.state, 'active')
          manager.close(function () {
            db.close()
            t.end()
          })
        })
      })
    })
  })
})

test('manager share', function (t) {
  var manager = Manager()
  var shareFiles = path.join(__dirname, 'fixtures')
  var tmpDir = os.tmpDir()
  manager.share('manager!share test', shareFiles, function (err, data) {
    t.ifError(err)
    t.same(data.key, 'manager!share test')
    t.same(data.value.state, 'active')
    var db = LocalDat({})
    db.download(data.value.link, tmpDir, function (err, stats) {
      t.ifError(err)
      t.same(stats.size, 48023, 'size is 48023')
      manager.close(function () {
        db.close()
        t.end()
      })
    })
  })
})
