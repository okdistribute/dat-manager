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

var StopButton = React.createClass({
  stop: function () {
    var self = this
    request(self.props.list.props.dat.name, 'stop', function (err, resp, data) {
      if (err) throw err
      self.props.list.flip()
    })
  },
  render: function () {
    return (
      <a className='btn red waves-effect waves-light list-item__button'
         onClick={this.stop}>
      <i className='material-icons left'>stop</i>Stop</a>
    )
  }
})

var StartButton = React.createClass({
  start: function () {
    var self = this
    request(self.props.list.props.dat.name, 'start', function (err, resp, data) {
      if (err) throw err
      self.props.list.flip()
    })
  },
  render: function () {
    return (
      <a className='btn waves-effect waves-light list-item__button'
         onClick={this.start}>
      <i className='material-icons left'>play_arrow</i>Start</a>
    )
  }
})


var ListItem = React.createClass({
  getInitialState: function () {
    return {running: this.props.dat.state === 'active'}
  },
  flip: function () {
    this.setState(function (prev) {
      return {running: !prev.running}
    })
  },
  render: function () {
    var running = this.state.running
    return (
      <div className='section list-item' onClick={this.handleClick}>
        <h5 className='list-item__name'>{this.props.dat.name}</h5>
        <div className='list-item__description'>{this.props.dat.link}</div>
        { running ? <StopButton list={this} /> : <StartButton list={this}/>}
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
