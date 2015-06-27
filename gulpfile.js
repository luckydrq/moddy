/**!
 * moddy - gulpfile.js
 *
 * Authors:
 *   luckydrq(http://github.com/luckydrq)
 */

'use strict';

/**
 * Module dependencies.
 */
var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('default', function () {
  return gulp.src([
      '**/*.js',
      '!gulpfile.js',
      '!node_modules/**/*.js',
      '!dist/**/*.js',
      '!test/**/*.js'
    ])
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});
