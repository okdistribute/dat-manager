# dat-manager

Deploy dats with a single endpoint.


### GET /

A list of currently deployed dats.

```
{
  "dats": [
    "politicaltweets.dathub.berkeley.edu"
  ]
}
```

### GET /:name

Proxy to the dat url that was generated.

#### Example

```
GET http://dat-manager.berkeley.edu/politicaltweets
```

Proxies to:

```
http://politicaltweets.dat-manager.berkeley.edu
```

### POST /:name?username=<username>

Creates a dat. Returns JSON, including a token that can be used to login
to the Dat using HTTP Basic Auth.

#### Example

```
POST http://dat-manager.berkeley.edu/politicaltweets
```

Returns

```
{
  "url": "http://politicaltweets.dat-manager.berkeley.edu",
  "token": "sbd2d4345sdfes"
}
```

On error:
```
{ "error": true, "message": "the error message goes here.."}
```

#### Options
`name`: The name of the new dat.
`username`: The username allowing access to the new dat.

### DELETE /:name

Delete a dat, removing all data and the redirect. It's gone. NADA!
