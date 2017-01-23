# koa-log

[![Build Status](https://travis-ci.org/vicanso/koa-log.svg?branch=master)](https://travis-ci.org/vicanso/koa-log)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/koa-log/master.svg?style=flat)](https://coveralls.io/r/vicanso/koa-log?branch=master)
[![npm](http://img.shields.io/npm/v/koa-log.svg?style=flat-square)](https://www.npmjs.org/package/koa-log)
[![Github Releases](https://img.shields.io/npm/dm/koa-log.svg?style=flat-square)](https://github.com/vicanso/koa-log)

HTTP request logger middleware for koa, refer to express/morgan and koa-logger

## API

```js
var logger = require('koa-log');
var morgan = logger.morgan;
```


#### Predefined Formats

There are various pre-defined formats provided:

##### combined

Standard Apache combined log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :length ":referrer" ":user-agent"
```

##### common

Standard Apache common log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :length
```

##### dev

Concise output colored by response status for development use. The `:status`
token will be colored red for server error codes, yellow for client error
codes, cyan for redirection codes, and uncolored for all other codes.

```
:method :url :status :response-time ms - :length
```

##### short

Shorter than default, also including response time.

```
:remote-addr :remote-user :method :url HTTP/:http-version :status :length - :response-time ms
```

##### tiny

The minimal output.

```
:method :url :status :length - :response-time ms
```


#### Tokens

##### Creating new tokens

To define a token, simply invoke `morgan.token()` with the name and a callback function. This callback function is expected to return a string value. The value returned is then available as ":type" in this case:

```js
morgan.token('type', function(ctx){ return ctx.get('content-type'); })
```

Calling `morgan.token()` using the same name as an existing token will overwrite that token definition.

##### :date[format]

The current date and time in UTC. The available formats are:

  - `clf` for the common log format (`"10/Oct/2000:13:55:36 +0000"`)
  - `iso` for the common ISO 8601 date time format (`2000-10-10T13:55:36.000Z`)
  - `web` for the common RFC 1123 date time format (`Tue, 10 Oct 2000 13:55:36 GMT`)

If no format is given, then the default is `web`.

##### :http-version

The HTTP version of the request.

##### :method

The HTTP method of the request.

##### :referrer

The Referrer header of the request. This will use the standard mis-spelled Referer header if exists, otherwise Referrer.

##### :remote-addr

The remote address of the request. This will use `req.ip`, otherwise the standard `req.connection.remoteAddress` value (socket address).

##### :remote-user

The user authenticated as part of Basic auth for the request.


##### :response-time

The time between the request coming into `morgan` and when the response headers are written, in milliseconds.

##### :status

The status code of the response.

##### :url

The URL of the request. This will use `req.originalUrl` if exists, otherwise `req.url`.

##### :user-agent

The contents of the User-Agent header of the request.

### morgan.compile(format)

Compile a format string into a function for use by `morgan`. A format string
is a string that represents a single log line and can utilize token syntax.
Tokens are references by `:token-name`. If tokens accept arguments, they can
be passed using `[]`, for example: `:token-name[pretty]` would pass the string
`'pretty'` as an argument to the token `token-name`.

Normally formats are defined using `morgan.format(name, format)`, but for certain
advanced uses, this compile function is directly available.


## Examples

```js
'use strict';
const Koa = require('koa');
const app = new Koa();
const koaLog = require('koa-log');


app.use(koaLog());

app.use(koaLog('dev'));
app.use((ctx, next) => {
	const delay = new Promise(function(resolve, reject) {
		setTimeout(resolve, 3000);
	});
	return delay.then(next);
});

// response

app.use(ctx => {
	ctx.body = 'Hello World';
});

app.listen(3000);

```

## License

MIT
