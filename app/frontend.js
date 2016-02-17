var request = require('nets')
var list = require('./components/list')

var $name = document.getElementById('name')
var $link = document.getElementById('link')

var dats

document.getElementById('submit').onclick = submit

function submit (event) {
  console.log('submitting', $link.value, $name.value)
  var opts = {
    uri: '/dats/' + $name.value + '/start?link=' + $link.value,
    json: true
  }
  request(opts, function (err, resp, json) {
    if (err) throw err
    dats.push(json)
    list(dats)
  })
}

request({uri: '/dats', json: true}, function (err, resp, json) {
  if (err) throw err
  dats = json.dats
  list(dats)
})
