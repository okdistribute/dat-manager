# dat-manager

Deploy dats with a single endpoint.


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

## TODO

* Update example script and route.
