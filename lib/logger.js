'use strict';
const debug = require('debug')('jt.koa-logger');
const util = require('util');
const _ = require('lodash');
const os = require('os');

module.exports = logger;

function logger(processName) {
  let requestTotal = 0;
  let handlingReqTotal = 0;
  let hostname = os.hostname();
  let pid = process.pid;
  debug('processName:%s, hostname:%s, pid:%s', processName, hostname, pid);
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
      var str = util.format('%s "%s %s HTTP/%s" %d %d %dms "%s" "%s" %d-%d-%d', ip, method, url, httpVersion, ctx.status, length, use, ctx.get('referer') || '', ctx.get('user-agent'), handlingReqTotal, index, requestTotal);
      handlingReqTotal--;
      console.info(str);
    }
    yield next;
    let use = Date.now() - start;
    let jtInfo = util.format('%s,%s,%d,%d,%d,%d,%d', hostname, processName, pid, handlingReqTotal, requestTotal, use, Date.now());
    let processList = ctx.header['x-process'] || '';
    ctx.set('X-Info', jtInfo);
  };
}
