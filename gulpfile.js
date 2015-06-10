var gulp = require('gulp');
var del = require('del');
var $ = require('gulp-load-plugins')({ camelCase: true });

gulp.task('clean', function(cb) {
  del(['build', 'tmp'], cb);
});

function makeLessTask(generateSourceMaps) {
  var task = gulp.src('*.less').pipe($.plumber());

  if (generateSourceMaps)
    task = task.pipe($.sourcemaps.init());

  task = task.pipe($.less())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR'],
      cascade: false
    }));

  if (generateSourceMaps)
    task = task.pipe($.sourcemaps.write('maps', { includeContent: false, sourceRoot: '/' }));

  return task.pipe(gulp.dest('tmp'));  
}

gulp.task('less', function() {
  return makeLessTask(false);
});

gulp.task('less:sourcemaps', function() {
  return makeLessTask(true);
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe($.plumber())
    .pipe($.webserver({
      open: true,
      host: '0.0.0.0',
      port: 8000,
      open: 'http://localhost:8000/'
    }));
});

gulp.task('watch', ['less:sourcemaps', 'webserver'], function() {
  gulp.watch('*.less', ['less:sourcemaps']);
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
    .pipe($.minifyHtml())
    .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:html', 'build:less', 'build:js']);

gulp.task('default', ['watch']);