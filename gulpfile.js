let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject('tsconfig.json');
const extToCopy = ['html', 'ttf', 'css'];
const outDir = 'out';

gulp.task('copy-non-ts-files', () => {
    let globs = [];
    extToCopy.forEach((ex) => globs.push('src/**/*.' + ex));

    return gulp.src(globs).pipe(gulp.dest(outDir));
});

gulp.task('default', ['copy-non-ts-files'], () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(outDir));
});

// var gulp = require('gulp');
// var sass = require('gulp-sass');

// const path = 'src/style/';

// gulp.task('sass', () => {
//     gulp.src(path + '*.scss')
//         .pipe(sass())
//         .pipe(gulp.dest((f) => {
//             return f.base;
//         }))
// });

// gulp.task('default', ['sass'], () => {
//     gulp.watch(path + '*.scss', ['sass']);
// });