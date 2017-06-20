const path = require("path");
const gulp = require('gulp');
const webpack = require('gulp-webpack');
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const yargs = require("yargs");
const exec = require('child_process').exec;
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const tslint = require('gulp-tslint');

const args =  yargs.argv;

const jsFolder = 'js';
const distFolder = 'dist';

const tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});
gulp.task('clean', () => {
    return gulp.src([jsFolder, distFolder, '*.vsix'])
        .pipe(clean());
});


gulp.task('webpack', ['clean'], () => {
    if (yargs.argv.nobundle) {
        return gulp.src(`${jsFolder}/**/*js`).pipe(gulp.dest(`${distFolder}`));
    } else {
        return webpack(require('./webpack.config.js'))
            .pipe(gulp.dest(`${distFolder}`));
    }
});

gulp.task('package', ['webpack', 'styles'], () => {
    const overrides = {}
    if (yargs.argv.release) {
        overrides.public = true;
    } else {
        const manifest = require('./vss-extension.json');
        overrides.name = manifest.name + ": Development Edition";
        overrides.id = manifest.id + "-dev";
    }
    const overridesArg = `--override "${JSON.stringify(overrides).replace(/"/g, '\\"')}"`;
    const manifestsArg = `--manifests vss-extension.json`;

    exec(`tfx extension create ${overridesArg} ${manifestsArg} --rev-version`,
        (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }

            console.log(stdout);
            console.log(stderr);
            
        });

});

gulp.task('default', ['package']);
