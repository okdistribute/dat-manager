var Manager = require('../')
var Dat = require('dat')
var rimraf = require('rimraf')
var path = require('path')
var memdb = require('memdb')
var test = require('tape')

var location = path.join(__dirname, 'manager_test')

test('manager start and stop', function (t) {
  var manager = Manager({
    location: location,
    db: memdb()
  })
  var db = Dat()
  db.addFiles(__dirname, function (err, link) {
    t.ifError(err)
    manager.start('mydat', link, function (err) {
      t.ifError(err)
      manager.stop('mydat', function (err) {
        t.ifError(err)
        //rimraf.sync(location)
        manager.close(function () {
          t.same(manager.running, {mydat: undefined})
          t.end()
        })
      })
    })
  })
})
