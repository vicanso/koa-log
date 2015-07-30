'use strict';
const morgan = {
  token : token,
  format : getFormatFunction
};
const formats = {
  combined : ':remote-addr [:date[clf]] ":method :url HTTP/:http-version" :status :length ":referrer" ":user-agent"',
  common : ':remote-addr [:date[clf]] ":method :url HTTP/:http-version" :status :length',
  tiny : ':method :url :status :length - :response-time ms [:cookie[_ga]]',
  short : ':remote-addr :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'
};

/**
 * Array of CLF month names.
 * @private
 */

const clfmonth = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

module.exports = morgan;

/**
 * [token description]
 * @param  {[type]} 'url'    [description]
 * @param  {[type]} function getUrlToken(ctx) {  return ctx.originalUrl || ctx.url;} [description]
 * @return {[type]}          [description]
 */
token('url', function getUrlToken(ctx) {
  return ctx.originalUrl || ctx.url;
});


/**
 * [token description]
 * @param  {[type]} 'length' [description]
 * @param  {[type]} function getLengthToken(ctx) {  if (ctx.length === undefined) {    return (ctx.body && ctx.body.length) || 0;  } else {    return ctx.length;  }} [description]
 * @return {[type]}          [description]
 */
token('length', function getLengthToken(ctx) {
  if (ctx.length === undefined) {
    return (ctx.body && ctx.body.length) || 0;
  } else {
    return ctx.length;
  }
});

/**
 * [token description]
 * @param  {[type]} 'method' [description]
 * @param  {[type]} function getMethodToken(ctx) {  return ctx.method;} [description]
 * @return {[type]}          [description]
 */
token('method', function getMethodToken(ctx) {
  return ctx.method;
});


/**
 * [token description]
 * @param  {[type]} 'response-time' [description]
 * @param  {[type]} function        getResponseTimeToken(ctx) {  let res = ctx.request;  let res = ctx.response;  if (!req._startAt || !res._startAt) {    return;  }  let ms = (res._startAt[0] - req._startAt[0]) * 1e3    + (res._startAt[1] - req._startAt[1]) * 1e-6;  return ms.toFixed(3);} [description]
 * @return {[type]}                 [description]
 */
token('response-time', function getResponseTimeToken(ctx) {
  let req = ctx.request;
  let res = ctx.response;
  if (!req._startAt || !res._startAt) {
    return;
  }
  let ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;

  return ms.toFixed(3);
});


/**
 * [token description]
 * @param  {[type]} 'referrer' [description]
 * @param  {[type]} function   getReferrerToken(ctx) {  return ctx.get('referer') || ctx.get('referrer');} [description]
 * @return {[type]}            [description]
 */
token('referrer', function getReferrerToken(ctx) {
  return ctx.get('referer') || ctx.get('referrer');
});


/**
 * [token description]
 * @param  {[type]} 'remote-addr' [description]
 * @param  {[type]} function      getip(ctx)    {  return ctx.ip || (ctx.ips && ctx.ips[0]);} [description]
 * @return {[type]}               [description]
 */
token('remote-addr', function getip(ctx) {
  return ctx.ip || (ctx.ips && ctx.ips[0]);
});


/**
 * [token description]
 * @param  {[type]} 'http-version' [description]
 * @param  {[type]} function       getHttpVersionToken(ctx) {  let req = ctx.req;  return req.httpVersionMajor + '.' + req.httpVersionMinor;} [description]
 * @return {[type]}                [description]
 */
token('http-version', function getHttpVersionToken(ctx) {
  let req = ctx.req;
  return req.httpVersionMajor + '.' + req.httpVersionMinor;
});


/**
 * [token description]
 * @param  {[type]} 'status' [description]
 * @param  {[type]} function getStatusToken(ctx) {  return ctx.status;} [description]
 * @return {[type]}          [description]
 */
token('status', function getStatusToken(ctx) {
  return ctx.status;
});


/**
 * [token description]
 * @param  {[type]} 'user-agent' [description]
 * @param  {[type]} function     getUserAgentToken(ctx) {  return ctx.get('user-agent');} [description]
 * @return {[type]}              [description]
 */
token('user-agent', function getUserAgentToken(ctx) {
  return ctx.get('user-agent');
});



/**
 * [token description]
 * @param  {[type]} 'date'   [description]
 * @param  {[type]} function getDateToken(ctx, format) {  let date = new Date();  switch (format || 'web') {    case 'clf':      return clfdate(date)    case 'iso':      return date.toISOString()    case 'web':      return date.toUTCString()  }} [description]
 * @return {[type]}          [description]
 */
token('date', function getDateToken(ctx, format) {
  let date = new Date();
  switch (format || 'web') {
    case 'clf':
      return clfdate(date);
    case 'iso':
      return date.toISOString();
    case 'web':
      return date.toUTCString();
  }
});

/**
 * [token description]
 * @param  {[type]} 'cookie' [description]
 * @param  {[type]} function getCookieToken(ctx, key) {  } [description]
 * @return {[type]}          [description]
 */
token('cookie', function getCookieToken(ctx, key) {
  return ctx.cookies.get(key) || '';
});

/**
 * [token description]
 * @param  {[type]}   name [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */
function token(name, fn) {
  morgan[name] = fn;
}



/**
 * [getFormatFunction description]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function getFormatFunction(name) {
  // lookup format
  var fmt = formats[name] || name || formats['default'];
  // return compiled format
  return typeof fmt !== 'function' ? compile(fmt) : fmt;
}


/**
 * Compile a format string into a function.
 *
 * @param {string} format
 * @return {function}
 * @public
 */

function compile(format) {
  if (typeof format !== 'string') {
    throw new TypeError('argument format must be a string');
  }

  let fmt = format.replace(/"/g, '\\"');
  let js = '  return "' +
  fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, function(_, name, arg) {
    return '"\n    + (tokens["' + name + '"](ctx, ' + String(JSON.stringify(arg)) + ') || "-") + "';
  }) + '";';
  /*jslint evil: true */
  return new Function('tokens, ctx', js);
}



/**
 * Format a Date in the common log format.
 *
 * @private
 * @param {Date} dateTime
 * @return {string}
 */

function clfdate(dateTime) {
  let date = dateTime.getUTCDate();
  let hour = dateTime.getUTCHours();
  let mins = dateTime.getUTCMinutes();
  let secs = dateTime.getUTCSeconds();
  let year = dateTime.getUTCFullYear();

  let month = clfmonth[dateTime.getUTCMonth()];

  return pad2(date) + '/' + month + '/' + year + ':' + pad2(hour) + ':' + pad2(mins) + ':' + pad2(secs) + ' +0000';
}



/**
 * Pad number to two digits.
 *
 * @private
 * @param {number} num
 * @return {string}
 */

function pad2(num) {
  let str = String(num);
  return (str.length === 1 ? '0' : '') + str;
}
