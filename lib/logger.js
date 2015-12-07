'use strict';
const debug = require('debug')('jt.koa-logger');
const morgan = require('./morgan');
logger.morgan = morgan;
module.exports = logger;

function logger(type) {
	/* istanbul ignore if */
	if (type === 'dev') {
		return require('./dev')();
	}
	type = type || /* istanbul ignore next */ 'combined';
	let requestTotal = 0;
	let handlingReqTotal = 0;
	const formatLine = morgan.format(type);
	return (ctx, next) => {
		const res = ctx.res;
		const onfinish = done.bind(null, 'finish');
		const onclose = done.bind(null, 'close');
		res.once('finish', onfinish);
		res.once('close', onclose);
		const start = Date.now();
		const index = ++requestTotal;
		handlingReqTotal++;
		ctx.request._startAt = process.hrtime();

		function done(event) {
			res.removeListener('finish', onfinish);
			res.removeListener('close', onclose);
			ctx.response._startAt = process.hrtime();
			try {
				const line = formatLine(morgan, ctx);
				handlingReqTotal--;
				console.info(`${line} ${handlingReqTotal}-${index}-${requestTotal}`);
			} catch (err) {
				/* istanbul ignore next */
				console.error(err);
			}

		}
		return next().then(() => {
			const now = Date.now();
			const use = now - start;
			ctx.set('X-Log', `${handlingReqTotal},${requestTotal},${use},${now}`);
		});

	};
}