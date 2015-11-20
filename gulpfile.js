var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var esdoc = require('gulp-esdoc');
var hyd = require('hydrolysis');

gulp.task('build', function () {
    return gulp.src('src/*.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('ccwc-video.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src'));
});

gulp.task('doc', function () {
    return gulp.src('./src')
        .pipe(esdoc({
            includes: ["es6"],
            "access": ["public", "protected", "private"],
            "plugins": [
                {"name": "./webcomponent-plugin.js"},
            ],
            autoPrivate: true,
            destination: "./docs",
            unexportIdentifier: true }));
});


gulp.task('default', ['build', 'doc']);