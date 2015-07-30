'use strict';
const debug = require('debug')('jt.koa-logger');
const util = require('util');
const _ = require('lodash');
const morgan = require('./morgan');
const dev = require('./dev');
logger.morgan = morgan;
module.exports = logger;

function logger(type) {
  if (type === 'dev') {
    return dev();
  }
  type = type || 'combined';
  let requestTotal = 0;
  let handlingReqTotal = 0;
  let formatLine = morgan.format(type);
  return function *(next) {
    /*jshint validthis:true */
    let ctx = this;
    ctx.request._startAt = process.hrtime();
    let start = Date.now();
    handlingReqTotal++;
    let index = ++requestTotal;
    let res = ctx.res;
    let onfinish = done.bind(null, 'finish');
    let onclose = done.bind(null, 'close');
    let xProcess = ctx.header['x-process'];

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event){
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      ctx.response._startAt = process.hrtime();

      let line = formatLine(morgan, ctx);
      handlingReqTotal--;
      console.info('%s %d-%d-%d', line, handlingReqTotal, index, requestTotal);
    }
    yield* next;
    let use = Date.now() - start;
    let jtInfo = util.format('%d,%d,%d,%d', handlingReqTotal, requestTotal, use, Date.now());
    ctx.set('X-Log', jtInfo);
  };
}
