var gulp = require('gulp');
var sass = require('gulp-sass');

const path = 'src/style/';

gulp.task('sass', () => {
    gulp.src(path + '*.scss')
        .pipe(sass())
        .pipe(gulp.dest((f) => {
            return f.base;
        }))
});

gulp.task('default', ['sass'], () => {
    gulp.watch(path + '*.scss', ['sass']);
});