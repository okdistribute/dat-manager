# dat-manager

Create, remove, and list deployed dats with a single REST endpoint.

## Built-in routes

### GET /

A list of currently deployed dats in JSON format.

Options

- `format`: supply ?format=<ndjson,json,csv> to format the return.

### POST /:name

Creates a dat with the given name. Returns JSON, including a token that can be used to login
to the Dat using HTTP Basic Auth.

Example:

```
curl http://dathub.org/politicaltweets \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"user": "karissa"}
```

Returns

```
{
  "name": "politicaltweets",
  "url": "http://politicaltweets.dathub.org",
  "token": "sbd2d4345sdfes"
}
```

On error:
```
{ "error": true, "message": "the error message goes here.."}
```

Options:

- `name`: The name of the new dat.
- `user`: The username allowing access to the new dat.

### GET /:name

Get info for a given dat.

Returns:
```
{
  "name": "politicaltweets",
  "url": "http://politicaltweets.dathub.org",
}
```

### DELETE /:name

Delete a dat, removing all data. It's gone. NADA!

Returns `{deleted: true}` if successful.

## Installation

Clone from github

```
git clone https://github.com/karissa/dat-manager.git
cd dat manager
npm install
npm link
```

## Deployment

Edit config.json **or** set environment variables for hostname and port.

The hostname is the domain where dats will be stored. The manager assumes you will be using subdomains for your deployed dats. For example, if you plan on hosting dats at `mydatname.website.org`, your `hostname` is `website.org`.

We recommend using [taco-nginx](http://github.com/mafintosh/taco-nginx) to deploy dats, and provide example scripts in scripts/initdat and scripts/rmdat. See the section on [Hosting a dat](http://datproject.readthedocs.org/en/latest/hosting/) for more information.

## TODO

* Provide an 'update' example script and route at '/ PUT'.
