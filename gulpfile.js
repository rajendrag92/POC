
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var less = require('gulp-less');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var del = require('del');

//Complie less and move less file to CSS folder
gulp.task('less',function(){
    return gulp.src(['node_modules/bootstrap/less/bootstrap.less'
                        ,'src/client/less/*.less'])
            .pipe(less())
            .pipe(gulp.dest('src/client/css'))
            .pipe(browserSync.stream())
});

//Move js from node_modules to build folder
gulp.task('vender-js',function(){

    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js',
                      'node_modules/jquery/dist/jquery.min.js',
                      'node_modules/d3/dist/d3.min.js',
                      'node_modules/underscore/underscore-min.js' ])
    .pipe(gulp.dest('src/client/build/js'))
    .pipe(browserSync.stream());

});

//setup static server and watch LESS and HTML file
gulp.task('serve',['less'],function(){
    browserSync.init({
        server:'./src/client/'
    });


    gulp.watch(['node_modules/bootstrap/less/bootstrap.less','src/client/less/*.less'],['less']);
    gulp.watch('src/client/*.html').on('change',browserSync.reload);

});

//setup static server and watch LESS and HTML file
gulp.task('bundle',function(){
    return gulp.src(['src/client/js/*.js',
    'src/client/js/core/*.js',
    'src/client/js/repositories/*.js',
    'src/client/js/utilities/*.js',
    'src/client/js/mapBuilder/mapLayer.js',
    'src/client/js/mapBuilder/mapBuilder.js',
    'src/client/js/nextBusMapBuilder/nextBusMapBuilder.js',
    ])
    .pipe(concat('bundle.js'))
    .pipe(minify())
    .pipe(gulp.dest('./src/client/build'));
});


gulp.task("cleanBuild",function(){
    return del(['./src/client/build/*.*','./src/client/build/js/*.*']);
});

gulp.task('default',['cleanBuild','vender-js','bundle','serve']);


