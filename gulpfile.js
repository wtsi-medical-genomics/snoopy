var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');
var replace = require('gulp-replace-task');
var run = require('gulp-run');
var del = require('del');

gulp.task('default', function() {
    
    // remove current dist directory
    del('dist', function (err) {
        console.log('Files deleted');
    });

    // compile code
    gulp.src('js/*.js')
    .pipe(closureCompiler({
        compilerPath: 'node_modules/closure-compiler/lib/vendor/compiler.jar',
        fileName: 'build.js'
    }))
    .pipe(gulp.dest('dist'));

    // remove references to uncompiled js code 
    gulp.src('index.html')
    .pipe(replace({
        patterns: [
            {
                match: '<script language="javascript" src="js/loadedfiletypes.js"></script>',
                replacement: ''
            },
            {
                match: '<script language="javascript" src="js/variants.js"></script>',
                replacement: ''
            },
            {
                match: '<script language="javascript" src="js/session.js"></script>',
                replacement: ''
            },
            {
                match: '<script language="javascript" src="js/main.js"></script>',
                replacement: '<script language="javascript" src="build.js"></script>'
            },
        ],
        usePrefix: false
    }))
    .pipe(gulp.dest('dist'));
  
    // copy over the necessary parts of dalliance 
    var files_dirs = [
        'css/*',
        'fonts/*',
        ['FileSaver.js/FileSaver.min.js' , 'FileSaver.js'],
        ['dalliance/build/*' , 'dalliance/'],
        'dalliance/css/*',
//        'dalliance/fonts/*',
        'dalliance/img/*'
    ]; 

    files_dirs.forEach(function(fd) {
        if (typeof(fd) === 'string') {
            var _src = fd;
            if (_src.slice(-1) === '*') {
                var _dest = 'dist/' + fd.slice(0,-1);
            } else {
                var _dest = 'dist/' + fd;
            }
        } else {
            var _src = fd[0];
            var _dest = 'dist/' + fd[1];
        }
        gulp.src(_src)
        .pipe(gulp.dest(_dest))
    });

});

