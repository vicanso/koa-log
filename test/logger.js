'use strict';
const assert = require('assert');
const EventEmitter = require('events');
const koaLog = require('../lib/logger');


describe('koa-log', function() {
	it('should log http request successful', function(done) {
		const combinedHandler = koaLog(':remote-addr - :cookie[vicanso] - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :length ":referrer" ":user-agent" - :response-time ms');
		const next = function() {
			return new Promise(function(resolve, reject) {
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
		}, next).then(function() {
			const origialInfo = console.info;
			console.info = function(str) {
				console.dir(str);
				console.info = origialInfo;
				done();
			};
			res.emit('close');
		}, done);

	});

});


// { host: 'localhost:3000',
//   connection: 'keep-alive',
//   'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36',
//   accept: '*/*',
//   referer: 'http://localhost:3000/',
//   'accept-encoding': 'gzip, deflate, sdch',
//   'accept-language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh-TW;q=0.4',
//   cookie: '_track=7998a09ee2c547ebb49fa51274308f61_1447381019329' }
// ::1 - - [04/Dec/2015:06:26:32 +0000] "GET /favicon.ico HTTP/1.1" 200 11 "http://localhost:3000/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36" - 3005.136 ms 0-3-3