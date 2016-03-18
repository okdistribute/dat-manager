# dat-manager

Manages all of your dats on a single machine.

[![Travis](https://api.travis-ci.org/karissa/dat-manager.svg)](https://travis-ci.org/karissa/dat-manager)

## API


### `var manager = Manager(opts)`

Creates a new manager instance. Any saved dats that are marked as 'active' will automatically join their swarm and start sharing data unless `start` is `false`.

##### Options

- `location`: the location on the local filesystem to store the data. defaults to `path.resolve('dats')`
- `db`: the levelup database instance for the manager.
- `datdb`: the levelup database instance for dat.
- `start`: default to `true`

### `Manager.share(key, location, cb)`

Will create a dat link and share the given local filesystem location. It also joins the dat swarm and begins sharing it.

Calls the callback with `cb(err, dat)`

### `Manager.start(key, opts, cb)`

Starts sharing a dat with the given key. If the dat doesn't exist with that key, it creates a new one and begins downloading it.

##### Options
- `link`: the link to use. If not provided, will use the one that is stored.
- `location`: the location to store the data.

### `Manager.stop(key, cb)`

Stops sharing the dat on the swarm.

### `Manager.get(cb)`

Get the metadata for the dat.

### `Manager.list`

List all dats and their metadata.

### `Manager.delete`

Deletes a dat from the system. If currently sharing the dat, will stop sharing it.

### `Manager.close`

Closes all of the swarm and database connections.

## Used by

- [dat-app](http://github.com/karissa/dat-app)
- [dat-server](http://github.com/karissa/dat-server)
