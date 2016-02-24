var React = require('react')
var nets = require('nets')
var ReactDOM = require('react-dom')
var EditInPlace = require('react-editinplace')

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
    nets(opts, function (err, resp, data) {
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
    var name = self.props.list.props.dat.key
    var opts = {
      uri: '/dats/' + name + '/start',
      json: true
    }
    nets(opts, function (err, resp, data) {
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

var DatName = React.createClass({
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
    nets(opts, function (err, resp, json) {
      if (err) throw err
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
          { this.state.running ? <StopButton list={this} /> : <StartButton list={this}/> }
          <DatName name={this.props.dat.key} />
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

module.exports = function render (dats) {
  ReactDOM.render(
    <List dats={dats} />,
    document.getElementById('app')
  )
}
