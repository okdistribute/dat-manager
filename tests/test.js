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
