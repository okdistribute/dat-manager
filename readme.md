# dat-manager

Create, remove, and list deployed dats with http. about 50% vaporware

## TODO:
- [ ] finish frontend

## Built-in routes

On error:
```
{ "error": true, "message": "the error message goes here.."}
```

### Main screen

GET `/`

Frontend index.html. Lists the currently hosted dats, with stop/start button. Can add a new dat.

### List dats

GET `/dats`

A list of currently deployed dats in JSON format.

Options

- `format`: supply ?format=<ndjson,json,csv> to format the return.

###  Get info for a given dat.

GET `/dats/:name`

Returns:
```
{
  "name": "politicaltweets",
  "link": "dat://thisisalink",
}
```

## Authenticated methods:

Don't worry about it now but at some point we need authentication.

Maybe just http basic auth.

### Start a dat

GET `/dats/:name/start`

Example:

```
curl http://dats.berkeley.edu/dats/mydat/start?link=thisisadathash
```

Could return download progress. (not that important)

```
{ "progress": 30 }
{ "progress": 100 }
{ "progress": 403 }
```

### Stop a dat

GET `/dats/:name/stop`

### Delete a dat

DELETE `/dats/:name`

Delete a dat, removing all data. It's gone. NADA!

Returns `{ deleted: true }` if successful.

## Installation

```
npm install -g dat-manager
```

or, clone from github

```
git clone https://github.com/karissa/dat-manager.git
cd dat manager
npm install
npm link
```

## Deployment

Edit config.json **or** set environment variables for `HOSTNAME` and `PORT`.

```
$ dat-manager --port=50001 --hostname=dat-manager.org
Listening on port 50001
^C
$ PORT=50002 dat-manager
Listening on port 50002
```

The hostname is the domain where dats will be stored. The manager assumes you will be using subdomains for your deployed dats. For example, if you plan on hosting dats at `mydatname.website.org`, your `hostname` is `website.org`.

We recommend using [taco-nginx](http://github.com/mafintosh/taco-nginx) to deploy dats, and provide example scripts in scripts/initdat and scripts/rmdat. See the section on [Hosting a dat](http://datproject.readthedocs.org/en/latest/hosting/) for more information.
