var koa = require('koa');
var router = require('koa-router')();
var logger = require('../lib/logger');



var app = koa();

var index = 0;
router.get('/', function *(next){
  yield function(done){
    setTimeout(done, 3000);
  };
  index++;
  this.body = 'abcd' + index;
});


app.use(logger('combined'));
app.use(logger('dev'));

app.use(router.routes());

var port = process.env.PORT || 10000;
app.listen(port);
console.dir('server listen on:' + port);
