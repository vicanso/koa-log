'use strict';
const debug = require('debug')('jt.koa-logger');
const util = require('util');
const _ = require('lodash');

module.exports = logger;

function logger(name) {
  let requestTotal = 0;
  let handlingReqTotal = 0;
  debug('log name:%s', name);
  return function *(next) {
    let start = Date.now();
    handlingReqTotal++;
    let index = ++requestTotal;
    let ctx = this;
    let res = ctx.res;
    let onfinish = done.bind(null, 'finish');
    let onclose = done.bind(null, 'close');
    let xProcess = ctx.header['x-process'];

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event){
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      let use = Date.now() - start;
      let ip = ctx.ips[0] || ctx.ip;
      let method = ctx.method;
      let url = ctx.request.url;
      let httpVersion = ctx.req.httpVersion;
      let header = ctx.request.header;
      let length = -1;
      if(!_.isUndefined(ctx.length)){
        length = ctx.length;
      }else{
        length = _.get(ctx, 'body.length');
      }
      var str = util.format('%s "%s %s HTTP/%s" %d %d %dms "%s" "%s" %d-%d-%d', ip, method, url, httpVersion, ctx.status, length || 0, use, ctx.get('referer') || '', ctx.get('user-agent'), handlingReqTotal, index, requestTotal);
      handlingReqTotal--;
      console.info(str);
    }
    yield* next;
    let use = Date.now() - start;
    let jtInfo = util.format('%s,%d,%d,%d,%d', name, handlingReqTotal, requestTotal, use, Date.now());
    ctx.set('X-Log', jtInfo);
  };
}
