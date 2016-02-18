var React = require('react')
var nets = require('nets')
var ReactDOM = require('react-dom')

function request (name, method, cb) {
  var opts = {
    uri: '/dats/' + name + '/' + method,
    json: true
  }
  return nets(opts, cb)
}

var ListItem = React.createClass({
  getInitialState: function () {
    return {running: this.props.dat.state === 'active'}
  },
  start: function () {
    var self = this
    request(self.props.dat.name, 'start', function (err, resp, data) {
      if (err) throw err
      self.setState({running: true})
      self.render()
    })
  },
  stop: function () {
    var self = this
    request(self.props.dat.name, 'stop', function (err, resp, data) {
      if (err) throw err
      self.setState({running: false})
      self.render()
    })
  },
  render: function () {
    var running = this.state.running
    return (
      <div onClick={this.handleClick}>
        <h2>{this.props.dat.name}</h2>
        <p>{this.props.dat.link}</p>
        <button type='submit' onClick={ running ? this.stop : this.start}>
        { running ? 'Stop' : 'Start' }
        </button>
      </div>
    )
  }
})

var List = React.createClass({
  render: function () {
    return (
      <div>
        {this.props.dats.map(function (dat) {
          return <ListItem dat={dat} />
        })}
      </div>
    )
  }
})


module.exports = function render (dats) {
  ReactDOM.render(
    <List dats={dats} />,
    document.getElementById('app')
  )
}
