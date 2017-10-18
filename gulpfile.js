var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpCopy = require('gulp-copy');

gulp.task('concat', function () {
    return gulp.src(['./src/ccwc-video.js', './src/ccwc-glvideo.js', './node_modules/ccwc-image-utils/webgl.js'])
        .pipe(concat('ccwc-video.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('copy', function () {
    gulp.src('src/ccwc-video.css')
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['concat', 'copy']);
