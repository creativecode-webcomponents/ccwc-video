var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var esdoc = require('gulp-esdoc');
var ghPages = require('gulp-gh-pages');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('ccwc-video', function () {
    return browserify({
        entries: 'src/ccwc-video.es6',
        standalone: 'CCWCVideo',
        extensions: ['es2015'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('ccwc-video.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
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
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
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


gulp.task('default', ['ccwc-video', 'ccwc-glvideo', 'doc']);