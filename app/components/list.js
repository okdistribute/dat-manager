var React = require('react')
var ReactDOM = require('react-dom')

var ListItem = React.createClass({
  start: function () {
    console.log('start')
  },
  stop: function () {
    console.log('stopped')
  },
  render: function () {
    var running = this.props.dat.state === 'active'
    return (
      <div onClick={this.handleClick}>
        <h2>{this.props.dat.name}</h2>
        <button type='submit'onClick={running ? this.stop : this.start}>
        {running ? 'Stop' : 'Start'}
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
