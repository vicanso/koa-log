'use strict';
const Koa = require('koa');
const app = new Koa();
const koaLog = require('../lib/logger');


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