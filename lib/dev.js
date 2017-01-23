'use strict';

/**
 * Module dependencies.
 */

const Counter = require('passthrough-counter');
const humanize = require('humanize-number');
const bytes = require('bytes');
const chalk = require('chalk');

/**
 * Color map.
 */

const colorCodes = {
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green',
};

/**
 * Development logger.
 */

function dev() {
  return function logger(ctx, next) {
    // request
    const start = new Date();
    /* eslint no-console: 0 */
    console.log(`  ${chalk.gray('<--')} ${chalk.bold(ctx.method)} ${chalk.gray(ctx.originalUrl)}`);


    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    const length = ctx.response.length;
    const body = ctx.body;
    let counter;
    if ((length === null || length === undefined) && body && body.readable) {
      /* eslint no-param-reassign: 0 */
      ctx.body = body
        .pipe(counter = new Counter())
        .on('error', ctx.onerror);
    }

    // log when the response is finished or closed,
    // whichever happens first.
    const res = ctx.res;
    const onfinish = done.bind(null, 'finish');
    const onclose = done.bind(null, 'close');
    /* eslint no-use-before-define: 0 */
    function done(event) {
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(ctx, start, counter ? counter.length : length, null, event);
    }

    res.once('finish', onfinish);
    res.once('close', onclose);
    return next();
  };
}

/**
 * Log helper.
 */

function log(ctx, start, len, err, event) {
  // get the status code of the response
  const status = err ? (err.status || 500) : (ctx.status || 404);

  // set the color of the status code;
  /* eslint no-bitwise:0 */
  const s = status / 100 | 0;
  const color = colorCodes[s] || colorCodes['4'];

  // get the human readable response length
  let length;
  /* eslint no-bitwise:0 */
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (len === null || len === undefined) {
    length = '-';
  } else {
    length = bytes(len);
  }
  /* eslint max-len: 0 */
  let upstream;
  if (err) {
    upstream = chalk.red('xxx');
  } else if (event === 'close') {
    upstream = chalk.yellow('-x-');
  } else {
    upstream = chalk.gray('-->');
  }
  console.log(`  ${upstream} ${chalk.bold(ctx.method)} ${chalk.gray(ctx.originalUrl)} ${chalk[color](status)} ${chalk.gray(time(start))} ${chalk.gray(length)}`);
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time(start) {
  let delta = new Date() - start;
  delta = delta < 10000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`;
  return humanize(delta);
}

/**
 * Expose logger.
 */

module.exports = dev;
