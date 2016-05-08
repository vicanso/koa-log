'use strict';
const assert = require('assert');
const EventEmitter = require('events');
const koaLog = require('../lib/logger');


describe('koa-log', () => {
  it('should log http request successful', done => {
    const combinedHandler = koaLog(':remote-addr - :cookie[vicanso] - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :length ":referrer" ":user-agent" - :response-time ms');
    const next = () => {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 5);
      });
    };
    const res = new EventEmitter();
    const request = {
      httpVersionMajor: 1,
      httpVersionMinor: 1,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36'
      }
    };
    combinedHandler({
      method: 'GET',
      set: function(name, xLog) {
        assert.equal(xLog.split(',').length, 4);
      },
      get: function(name) {
        return request.headers[name];
      },
      cookies: {
        get: function() {
          return '123456'
        }
      },
      body: 'abc',
      length: 3,
      res: res,
      response: res,
      request: request,
      req: request
    }, next).then(() => {
      const origialInfo = console.info;
      console.info = str => {
        console.dir(str);
        console.info = origialInfo;
        done();
      };
      res.emit('close');
    }, done);
  });

});