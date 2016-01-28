var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var esdoc = require('gulp-esdoc');
var ghPages = require('gulp-gh-pages');
var runSequence = require('gulp-run-sequence');


var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('test', function () {
    return browserify({
        entries: 'src/classb.es6',
        standalone: 'testclass',
        extensions: ['es2015'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('testclass.js'))
        .pipe(gulp.dest('./src'));
});



gulp.task('ccwc-video', function () {
    return browserify({
        entries: 'src/ccwc-video.es6',
        standalone: 'CCWCVideo',
        extensions: ['es2015'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('ccwc-video.js'))
        .pipe(gulp.dest('./src'));
});


gulp.task('ccwc-glvideo', function () {
    return browserify({
        entries: 'src/ccwc-glvideo.es6',
        standalone: 'CCWCGLVideo',
        extensions: ['es2015'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('ccwc-glvideo.js'))
        .pipe(gulp.dest('./src'));
});

gulp.task('glbuild', function () {
    return gulp.src(['node_modules/ccwc-image-utils/ccwc-image-utils-webgl.js', 'src/ccwc-video.js'])
        .pipe(concat('ccwc-glvideo.js'))
        .pipe(sourcemaps.init())
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