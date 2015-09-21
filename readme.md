# dat-manager

Deploy dats with a single endpoint.


### GET /

A list of currently deployed dats.

### POST /

Creates a dat. Returns JSON, including a token that can be used to login
to the Dat using HTTP Basic Auth.

#### Example

```
curl http://dathub.org/politicaltweets \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"user": "karissa", "name": "politicaltweets"}'   
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

#### Options
`name`: The name of the new dat.
`user`: The username allowing access to the new dat.

### DELETE /:name

Delete a dat, removing all data. It's gone. NADA!
