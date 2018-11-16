var gulp = require('gulp');
var bs = require('browser-sync').create();

gulp.task('browser-sync', function() {
    bs.init({
        server: {
            baseDir: "./"
        }
    });
});


gulp.task('watch', ['browser-sync'], function () {
    gulp.watch(["index.html", "js/*.*","js/libs/*.*","data/*.*","test/*.html", "pages/*.html", "css/*.css"]).on('change', bs.reload);
});
