var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var esdoc = require('gulp-esdoc');
var ghPages = require('gulp-gh-pages');
var runSequence = require('gulp-run-sequence');

gulp.task('build', function () {
    return gulp.src('src/ccwc-video.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('ccwc-video.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src'));
});

gulp.task('glbuild', function () {
    return gulp.src(['node_modules/ccwc-image-utils/src/webglfilter.js', 'node_modules/ccwc-image-utils/src/shaders.js', 'src/ccwc-video.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('ccwc-glvideo.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src'));
});


gulp.task('deploy', function() {
    return gulp.src(['./**', '!./node_modules/**'])
        .pipe(ghPages());
});

gulp.task('doc', function () {
    return gulp.src('./src')
        .pipe(esdoc({
            includes: ["es6"],
            "access": ["public", "protected", "private"],
            autoPrivate: true,
            destination: "./docs",
            unexportIdentifier: true }));
});


gulp.task('default', ['build', 'glbuild', 'doc'], function(cb) {
    runSequence('build', 'glbuild', 'doc', cb);
});