var gulp = require('gulp'),
  watch = require('gulp-watch'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  util = require('gulp-util'),
  jshint = require('gulp-jshint'),
  replace = require('gulp-replace'),
  insert = require('gulp-insert'),
  exec = require('child_process').exec,
  fs = require('fs'),
  package = require('./package.json'),
  browserify = require('browserify'),
  streamify = require('gulp-streamify'),
  source = require('vinyl-source-stream'),
  merge = require('merge-stream');

var srcDir = './src/';
var outDir = './';

var header = "/*!\n\
 * Chart.bands.js\n\
 * Version: {{ version }}\n\
 *\n\
 * Copyright 2016 BBC\n\
 * Released under the MIT license\n\
 * https://github.com/BBC/Chart.bands.js/blob/master/LICENSE.md\n\
 */\n";

gulp.task('watch', watchTask);
gulp.task('build', buildTask);
gulp.task('jshint', jshintTask);

function watchTask() {
    gulp.watch('./src/*.js', buildTask);
}

function buildTask() {
    console.log('build');
    var nonBundled = browserify('./src/chart.bands.js')
        .ignore('Chart')
        .bundle()
        .pipe(source('Chart.Bands.js'))
        .pipe(insert.prepend(header))
        .pipe(streamify(replace('{{ version }}', package.version)))
        .pipe(gulp.dest(outDir))
        .pipe(streamify(uglify({
            preserveComments: 'some'
        })))
        .pipe(streamify(concat('Chart.Bands.min.js')))
        .pipe(gulp.dest(outDir));

    return nonBundled;

}

function jshintTask() {
    return gulp.src(srcDir + '**/*.js')
        .pipe(jshint('config.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
}
