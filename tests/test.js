var Manager = require('../')
var Dat = require('dat')
var path = require('path')
var memdb = require('memdb')
var test = require('tape')

var location = path.join(__dirname, 'manager_test')
var manager = Manager({
  location: location,
  db: memdb({valueEncoding: 'json'})
})

test('manager start and stop', function (t) {
  var db = Dat()
  db.addFiles(path.join(__dirname, 'fixtures'), function (err, link) {
    t.ifError(err)
    manager.start('mydat', {link: link}, function (err) {
      t.ifError(err)
      t.same(typeof manager.swarms.mydat, 'object')
      manager.stop('mydat', function (err) {
        t.ifError(err)
        t.same(manager.swarms.mydat, undefined)
        manager.close(function () {
          db.close()
          t.end()
        })
      })
    })
  })
})

test('list dats', function (t) {
  manager.list(function (err, data) {
    t.ifError(err)
    t.same(data[0].name, 'mydat')
    t.same(data[0].state, 'inactive')
    t.end()
  })
})
