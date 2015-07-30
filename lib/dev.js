'use strict';
/**
 * Module dependencies.
 */

const Counter = require('passthrough-counter');
const humanize = require('humanize-number');
const bytes = require('bytes');
const chalk = require('chalk');


/**
 * Expose logger.
 */

module.exports = dev;

/**
 * Color map.
 */

const colorCodes = {
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green'
};

/**
 * Development logger.
 */

function dev(opts) {
  return function *logger(next) {
    // request
    let start = new Date();
    console.log('  ' + chalk.gray('<--') + ' ' + chalk.bold('%s') + ' ' + chalk.gray('%s'), this.method, this.originalUrl);

    try {
      yield next;
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, null, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    let length = this.response.length;
    let body = this.body;
    let counter;
    if ((null === length  || undefined === length)&& body && body.readable) {
      this.body = body
        .pipe(counter = new Counter())
        .on('error', this.onerror);
    }

    // log when the response is finished or closed,
    // whichever happens first.
    let ctx = this;
    let res = this.res;

    let onfinish = done.bind(null, 'finish');
    let onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event){
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(ctx, start, counter ? counter.length : length, null, event);
    }
  };
}

/**
 * Log helper.
 */

function log(ctx, start, len, err, event) {
  // get the status code of the response
  let status = err ? (err.status || 500) : (ctx.status || 404);

  // set the color of the status code;
  let s = status / 100 | 0;
  let color = colorCodes[s] || colorCodes['4'];

  // get the human readable response length
  let length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (null === len || undefined === len) {
    length = '-';
  } else {
    length = bytes(len);
  }

  let upstream = err ? chalk.red('xxx') : event === 'close' ? chalk.yellow('-x-') : chalk.gray('-->');

  console.log('  ' + upstream + ' ' + chalk.bold('%s') + ' ' + chalk.gray('%s') + ' ' + chalk[color]('%s') + ' ' + chalk.gray('%s') + ' ' + chalk.gray('%s'), ctx.method, ctx.originalUrl, status, time(start), length);
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time(start) {
  let delta = new Date() - start;
  delta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's';
  return humanize(delta);
}
