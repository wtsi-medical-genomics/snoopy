var gulp = require('gulp');
var config = require('../config').dalliance;

gulp.task('copyDalliance', function() {
  return Object.keys(config).map(function (loc) {
	var foo = config[loc];
	return gulp.src(foo.src)
	    .pipe(gulp.dest(foo.dest));
  });
});
