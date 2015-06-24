var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');


gulp.task('jshint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint({
      predef : ['require', 'module'],
      node : true,
      esnext : true
    }))
    .pipe(jshint.reporter('default'));
});


gulp.task('default', ['jshint']);
