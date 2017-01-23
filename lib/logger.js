'use strict';

const morgan = require('./morgan');

function logger(_type) {
  /* istanbul ignore if */
  if (_type === 'dev') {
    /* eslint global-require:0 */
    return require('./dev')();
  }
  const type = _type || 'combined';
  const formatLine = morgan.format(type);
  return (ctx, next) => {
    const res = ctx.res;
    const onfinish = done.bind(null, 'finish');
    const onclose = done.bind(null, 'close');
    res.once('finish', onfinish);
    res.once('close', onclose);
    /* eslint no-underscore-dangle: 0 no-param-reassign: 0 */
    ctx.request._startAt = process.hrtime();

    /* eslint no-use-before-define: 0 */
    function done() {
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      /* eslint no-underscore-dangle: 0 no-param-reassign: 0 */
      ctx.response._startAt = process.hrtime();
      try {
        const line = formatLine(morgan, ctx);
        /* eslint no-console:0 */
        console.info(line);
      } catch (err) {
        /* eslint no-console:0 */
        /* istanbul ignore next */
        console.error(err);
      }
    }
    return next();
  };
}

logger.morgan = morgan;

module.exports = logger;
