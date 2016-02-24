var React = require('react')
var nets = require('nets')
var ReactDOM = require('react-dom')
var EditInPlace = require('react-editinplace')


function request (name, method, cb) {
  var opts = {
    uri: '/dats/' + name + '/' + method,
    json: true
  }
  return nets(opts, cb)
}

var StopButton = React.createClass({
  getInitialState: function () {
    return {loading: false}
  },
  stop: function () {
    var self = this
    self.setState({loading: true})
    request(self.props.list.props.dat.name, 'stop', function (err, resp, data) {
      if (err) throw err
      self.setState({loading: false})
      self.props.list.toggle()
    })
  },
  render: function () {
    var icon = this.loading ? 'loop' : 'stop'
    return (
      <a className='btn red waves-effect waves-light list-item__button'
         onClick={this.stop}>
      <i className='material-icons'>{icon}</i></a>
    )
  }
})

var StartButton = React.createClass({
  getInitialState: function () {
    return {loading: false}
  },
  start: function () {
    var self = this
    self.setState({loading: true})
    request(self.props.list.props.dat.name, 'start', function (err, resp, data) {
      if (err) throw err
      self.setState({loading: false})
      self.props.list.toggle()
    })
  },
  render: function () {
    var icon = this.state.loading ? 'loop' : 'play_arrow'
    return (
      <a className='btn waves-effect waves-light list-item__button'
         onClick={this.start}>
      <i className='material-icons'>{icon}</i></a>
    )
  }
})


var ListItem = React.createClass({
  getInitialState: function () {
    return {
      name: this.props.dat.name,
      running: this.props.dat.state === 'active'
    }
  },
  nameChange: function (text) {
    console.log(text)
  },
  toggle: function () {
    this.setState(function (prev) {
      return {running: !prev.running}
    })
  },
  render: function () {
    return (
      <div className='section list-item' onClick={this.handleClick}>
        <div className="divider"></div>
        <div className="row">
          <EditInPlace
            onChange={this.nameChange}
            text={this.state.name}
            className='list-item__name col' />
          <p> { this.props.dat.link } </p>
            { this.state.running ? <StopButton list={this} /> : <StartButton list={this}/> }
        </div>
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
