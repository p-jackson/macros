var gulp = require('gulp');
var del = require('del');
var $ = require('gulp-load-plugins')({ camelCase: true });

gulp.task('clean', function(cb) {
  del(['build', 'tmp'], cb);
});

gulp.task('less', function() {
  return gulp.src('*.less')
    .pipe($.plumber())
    .pipe($.less())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR'],
      cascade: false
    }))
    .pipe(gulp.dest('tmp'));
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe($.plumber())
    .pipe($.webserver({
      open: true
    }));
});

gulp.task('watch', ['less', 'webserver'], function() {
  gulp.watch('*.less', ['less']);
});

gulp.task('build:less', ['less'], function() {
  return gulp.src('tmp/style.css')
    .pipe($.minifyCss())
    .pipe(gulp.dest('tmp/minified'));
});

gulp.task('build:js', function() {
  return gulp.src('main.js')
    .pipe($.uglify())
    .pipe(gulp.dest('tmp/minified'));
});

gulp.task('build:revision', ['build:less', 'build:js'], function() {
  return gulp.src('tmp/minified/*.{css,js}')
    .pipe($.rev())
    .pipe(gulp.dest('build'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('tmp'));
});

gulp.task('build:html', ['build:revision'], function() {
  var manifest = gulp.src('tmp/rev-manifest.json');

  return gulp.src('index.html')
    .pipe($.htmlReplace({
      css: 'style.css'
    }))
    .pipe($.revReplace({ manifest: manifest }))
    //.pipe($.minifyHtml())
    .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:html', 'build:less', 'build:js']);

gulp.task('default', ['watch']);