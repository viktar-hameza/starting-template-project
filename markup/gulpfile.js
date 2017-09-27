var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var runSequence = require('run-sequence');
var notify = require("gulp-notify");
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var inlinesvg = require('postcss-inline-svg');
var cssnano = require('cssnano');

// Styles
gulp.task('styles', function () {
	return gulp.src('src/assets/stylesheets/*.scss')
		.pipe(sourcemaps.init())
			.pipe(sass())
			.on('error', notify.onError(function(err){
				return {
					title: 'Styles compilation error',
					message: err.message
				}
			}))
			.pipe(postcss([
				inlinesvg({removeFill: true })
			]))
			.pipe(postcss([autoprefixer({browsers: ['> 1%'], cascade: false})]))
		.pipe(sourcemaps.write('./stylemaps'))
		.pipe(gulp.dest('public/assets/stylesheets'));
});

// css minify
gulp.task('cssnano', function () {
  gulp.src('public/assets/stylesheets/*.css')
    .pipe(postcss([
      cssnano()
    ]))
    .pipe(gulp.dest('public/assets/stylesheets'));
});

// Pug
gulp.task('pug', function() {
	return gulp.src('src/pages/*.pug')
		.pipe(pug({
			pretty: true
		}))
		.on('error', notify.onError(function(err){
			return {
				title: 'Pug compilation error',
				message: err.message
			}
		}))
		.pipe(gulp.dest('public/'))
});

//Copy JS
gulp.task('copyJs', function() {
		gulp.src(['./src/assets/scripts/*vendor/**/*',
							'./src/assets/scripts/*.js'])
		.pipe(gulp.dest('public/assets/scripts/'));
});

// Copy Fonts
gulp.task('copyFonts', function() {
		gulp.src('./src/assets/fonts/**/*')
		.pipe(gulp.dest('public/assets/fonts/'));
});

// Copy Images
gulp.task('copyImages', function() {
		gulp.src('./src/assets/images/**/*')
		.pipe(gulp.dest('public/assets/images/'));
});

// Copy temporary pictures
gulp.task('copyTempPics', function() {
		gulp.src('./src/assets/temp/**/*')
		.pipe(gulp.dest('public/temp/'));
});

// Watch taskes
gulp.task('watch', function() {
	gulp.watch(['src/assets/stylesheets/*.scss',
							'src/assets/stylesheets/**/*.scss',
							'src/assets/stylesheets/**/**/*.scss',
							'src/templates/**/*.scss'], ['styles']);
	gulp.watch(['src/pages/*.pug',
							'src/pages/**/*.pug',
							'src/templates/**/*.pug',
							'src/templates/**/*.html'], ['pug']);
	gulp.watch(['src/assets/fonts/*.*', 'src/assets/fonts/**/*.*'], ['copyFonts']);
	gulp.watch(['src/assets/scripts/*.*','src/assets/scripts/**/*.*'], ['copyJs']);
	gulp.watch(['src/assets/images/*.*', 'src/assets/images/**/*.*'], ['copyImages']);
	gulp.watch(['src/assets/temp/*.*', 'src/assets/temp/**/*.*'], ['copyTempPics']);
});

gulp.task('default', function(callback) {
	runSequence( 
		['styles', 'pug', 'copyFonts', 'copyJs', 'copyImages', 'copyTempPics', 'watch'],
		callback);
});