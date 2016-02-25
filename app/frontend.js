var xhr = require('./request')
var renderList = require('./components/list')

var $name = document.getElementById('name')
var $link = document.getElementById('link')

document.getElementById('submit').onclick = submit

function submit (event) {
  var opts = {
    uri: '/dats/' + $name.value + '/start?link=' + $link.value,
    json: true
  }
  xhr(opts, function (resp, json) {
    renderList()
  })
}

renderList()
