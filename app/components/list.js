var React = require('react')
var ReactDOM = require('react-dom')
var EditInPlace = require('react-editinplace')

var xhr = require('../request.js')
var error = require('./error.js')

var StopButton = React.createClass({
  getInitialState: function () {
    return {loading: false}
  },
  stop: function () {
    var self = this
    self.setState({loading: true})
    var name = self.props.list.props.dat.key
    var opts = {
      uri: '/dats/' + name + '/stop',
      json: true
    }
    xhr(opts, function (resp, data) {
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
    var name = self.props.list.props.dat.key
    var opts = {
      uri: '/dats/' + name + '/start',
      json: true
    }
    xhr(opts, function (resp, data) {
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

var NameLabel = React.createClass({
  getInitialState: function () {
    return {
      name: this.props.name
    }
  },
  nameChange: function (text) {
    var self = this
    var opts = {
      uri: '/dats/' + self.state.name,
      method: 'PUT',
      json: {
        name: text
      }
    }
    xhr(opts, function (resp, json) {
      self.setState({name: text})
    })
  },
  validation: function (text) {
    var match = text.match(/^[a-zA-Z0-9_]*$/)
    if (match) return true
    else return false
  },
  render: function () {
    return <EditInPlace
      validate={this.validation}
      onChange={this.nameChange}
      text={this.state.name}
      className='list-item__name' />
  }
})

var ListItem = React.createClass({
  getInitialState: function () {
    return {
      running: this.props.dat.value.state === 'active'
    }
  },
  delete: function () {
    var self = this
    var opts = {
      uri: '/dats/' + this.props.dat.key,
      method: 'DELETE',
      json: true
    }
    xhr(opts, function (resp, json) {
      render()
    })
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
          <a className="right btn" onClick={this.delete}>x</a>
          { this.state.running ? <StopButton list={this} /> : <StartButton list={this}/> }
          <NameLabel name={this.props.dat.key} />
          <p> { this.props.dat.value.link } </p>
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

module.exports = render

function render (cb) {
  xhr({uri: '/dats', json: true}, function (resp, json) {
    _render(json.dats)
    if (cb) cb(json.dats)
  })
}

function _render (dats) {
  ReactDOM.render(
    <List dats={dats} />,
    document.getElementById('app')
  )
}
