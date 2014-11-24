var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');
var replace = require('gulp-replace-task');
var run = require('gulp-run');

gulp.task('default', function() {
    gulp.src('js/*.js')
    .pipe(closureCompiler({
        compilerPath: 'node_modules/closure-compiler/lib/vendor/compiler.jar',
        fileName: 'build.js'
    }))
    .pipe(gulp.dest('dist'));

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
                match: '<script language="javascript" src="js/main.js"></script>',
                replacement: '<script language="javascript" src="build.js"></script>',
            }
 
        ],
        usePrefix: false
    }))
    .pipe(gulp.dest('dist'));
   
    var files_dirs = [
        'css/*',
        'fonts/*',
        ['FileSaver.js/FileSaver.min.js' , 'FileSaver.js'],
        ['dalliance/build/*' , 'dalliance/'],
        'dalliance/css/*',
        'dalliance/fonts/*',
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

