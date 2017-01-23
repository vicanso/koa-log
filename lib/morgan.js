'use strict';

const auth = require('basic-auth');

const formats = {
  /* eslint max-len:0 */
  combined: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :length ":referrer" ":user-agent" - :response-time ms',
  /* eslint max-len:0 */
  common: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :length',
  tiny: ':method :url :status :length - :response-time ms [:cookie[_ga]]',
  /* eslint max-len:0 */
  short: ':remote-addr - :remote-user :method :url HTTP/:http-version :status :length - :response-time ms',
};

/**
 * Compile a format string into a function.
 *
 * @param {string} format
 * @return {function}
 * @public
 */
function compile(format) {
  /* istanbul ignore if */
  if (typeof format !== 'string') {
    throw new TypeError('argument format must be a string');
  }
  const fmt = format.replace(/"/g, '\\"');
  /* eslint prefer-template:0 */
  const js = '  return "' +
    fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, (_, name, arg) => {
      const str = '"\n    + (tokens["' + name + '"](ctx, ';
      return str + String(JSON.stringify(
        arg)) + ') || "-") + "';
    }) + '";';
  /* eslint no-new-func:0 */
  return new Function('tokens, ctx', js);
}

/**
 * [getFormatFunction description]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function getFormatFunction(name) {
  // lookup format
  const fmt = formats[name] || name || formats.default;
  // return compiled format
  return typeof fmt !== 'function' ? compile(fmt) : fmt;
}

const morgan = {
  format: getFormatFunction,
};

/**
 * [token description]
 * @param  {[type]}   name [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */
function token(name, fn) {
  morgan[name] = fn;
}

morgan.token = token;

/**
 * Array of CLF month names.
 * @private
 */

const clfmonth = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * [token description]
 * @param  {[type]} 'url'    [description]
 * @param  {[type]} function getUrlToken(ctx) {  return ctx.originalUrl || ctx.url;} [description]
 * @return {[type]}          [description]
 */
token('url', ctx => ctx.originalUrl || ctx.url);


/**
 * [token description]
 * @param  {[type]} 'length' [description]
 * @param  {[type]} function getLengthToken(ctx) {  if (ctx.length === undefined) {    return (ctx.body && ctx.body.length) || 0;  } else {    return ctx.length;  }} [description]
 * @return {[type]}          [description]
 */
token('length', (ctx) => {
  /* istanbul ignore if */
  if (ctx.length === undefined) {
    return ctx.body && ctx.body.length;
  }
  return ctx.length;
});

/**
 * [token description]
 * @param  {[type]} 'method' [description]
 * @param  {[type]} function getMethodToken(ctx) {  return ctx.method;} [description]
 * @return {[type]}          [description]
 */
token('method', ctx => ctx.method);


/**
 * [token description]
 * @param  {[type]} 'response-time' [description]
 * @param  {[type]} function        getResponseTimeToken(ctx) {  let res = ctx.request;  let res = ctx.response;  if (!req._startAt || !res._startAt) {    return;  }  let ms = (res._startAt[0] - req._startAt[0]) * 1e3    + (res._startAt[1] - req._startAt[1]) * 1e-6;  return ms.toFixed(3);} [description]
 * @return {[type]}                 [description]
 */
token('response-time', (ctx) => {
  const req = ctx.request;
  const res = ctx.response;
  /* istanbul ignore if */
  /* eslint no-underscore-dangle:0 */
  if (!req._startAt || !res._startAt) {
    return '';
  }
  /* eslint no-underscore-dangle:0 */
  const ms0 = (res._startAt[0] - req._startAt[0]) * 1e3;
  const ms1 = (res._startAt[1] - req._startAt[1]) * 1e-6;
  const ms = ms0 + ms1;

  return ms.toFixed(3);
});


/**
 * [token description]
 * @param  {[type]} 'referrer' [description]
 * @param  {[type]} function   getReferrerToken(ctx) {  return ctx.get('referer') || ctx.get('referrer');} [description]
 * @return {[type]}            [description]
 */
token('referrer', ctx => ctx.get('referer') || ctx.get('referrer'));


/**
 * [token description]
 * @param  {[type]} 'remote-addr' [description]
 * @param  {[type]} function      getip(ctx)    {  return ctx.ip;  } [description]
 * @return {[type]}               [description]
 */
token('remote-addr', ctx => ctx.ip);


/**
 * [token description]
 * @param  {[type]} 'remote-user' [description]
 * @param  {[type]} function      getRemoteUserToken(ctx) {  let credentials = auth(ctx.req);  return credentials? credentials.name : undefined;} [description]
 * @return {[type]}               [description]
 */
token('remote-user', (ctx) => {
  const credentials = auth(ctx.req);
  return credentials ? credentials.name : '';
});

/**
 * [token description]
 * @param  {[type]} 'http-version' [description]
 * @param  {[type]} function       getHttpVersionToken(ctx) {  let req = ctx.req;  return req.httpVersionMajor + '.' + req.httpVersionMinor;} [description]
 * @return {[type]}                [description]
 */
token('http-version', (ctx) => {
  const req = ctx.req;
  return req.httpVersionMajor + '.' + req.httpVersionMinor;
});

/**
 * [token description]
 * @param  {[type]} 'status' [description]
 * @param  {[type]} function getStatusToken(ctx) {  return ctx.status;} [description]
 * @return {[type]}          [description]
 */
token('status', ctx => ctx.status);

/**
 * [token description]
 * @param  {[type]} 'user-agent' [description]
 * @param  {[type]} function     getUserAgentToken(ctx) {  return ctx.get('user-agent');} [description]
 * @return {[type]}              [description]
 */
token('user-agent', ctx => ctx.get('user-agent'));

/**
 * Pad number to two digits.
 *
 * @private
 * @param {number} num
 * @return {string}
 */
function pad2(num) {
  const str = String(num);
  return (str.length === 1 ? '0' : '') + str;
}

/**
 * Format a Date in the common log format.
 *
 * @private
 * @param {Date} dateTime
 * @return {string}
 */
function clfdate(dateTime) {
  const date = dateTime.getUTCDate();
  const hour = dateTime.getUTCHours();
  const mins = dateTime.getUTCMinutes();
  const secs = dateTime.getUTCSeconds();
  const year = dateTime.getUTCFullYear();

  const month = clfmonth[dateTime.getUTCMonth()];

  return pad2(date) + '/' + month + '/' + year + ':' + pad2(hour) + ':' + pad2(
    mins) + ':' + pad2(secs) + ' +0000';
}

/**
 * [token description]
 * @param  {[type]} 'date'   [description]
 * @param  {[type]} function getDateToken(ctx, format) {  let date = new Date();  switch (format || 'web') {    case 'clf':      return clfdate(date)    case 'iso':      return date.toISOString()    case 'web':      return date.toUTCString()  }} [description]
 * @return {[type]}          [description]
 */
token('date', (ctx, format) => {
  let date = new Date();
  switch (format || 'web') {
    case 'clf':
      date = clfdate(date);
      break;
    /* istanbul ignore next */
    case 'web':
      date = date.toUTCString();
      break;
    /* istanbul ignore next */
    default:
      date = date.toISOString();
      break;
  }
  return date;
});

/**
 * [token description]
 * @param  {[type]} 'cookie' [description]
 * @param  {[type]} function getCookieToken(ctx, key) {  } [description]
 * @return {[type]}          [description]
 */
token('cookie', (ctx, key) => ctx.cookies.get(key) || '');

module.exports = morgan;
