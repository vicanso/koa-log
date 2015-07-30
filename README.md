# logger middlware for koa，refer to express/morgan and koa-logger

```js
var koa = require('koa');
var router = require('koa-router')();
var logger = require('koa-log');



var app = koa();

var index = 0;
router.get('/', function *(next){
  yield function(done){
    setTimeout(done, 3000);
  };
  index++;
  this.body = 'abcd' + index;
});


app.use(logger());


app.use(router.routes());

var port = process.env.PORT || 10000;
app.listen(port);
console.dir('server listen on:' + port);

```
