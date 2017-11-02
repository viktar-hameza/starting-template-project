'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const runSequence = require('run-sequence');
const notify = require("gulp-notify");
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const inlinesvg = require('postcss-inline-svg');
const imageInliner = require('postcss-image-inliner');
const svgo = require('postcss-svgo');
const objectFitImages = require('postcss-object-fit-images');
const cssnano = require('cssnano');
const browserSync = require('browser-sync');

const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

const buffer = require('vinyl-buffer');
const merge = require('merge-stream');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const spritesmith = require('gulp.spritesmith');

const del = require('del');

// Start browserSync server
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'public',
    },
    port: 2000,
    open: true,
    notify: false
  });
});

// postcss plugins
let postCssPlugins = [
  autoprefixer({browsers: ['> 1%'], cascade: false}),
  inlinesvg(),
  svgo(),
  objectFitImages(),
  imageInliner({
    assetPaths: ['src/assets/images/img_to_bg/'],
    maxFileSize: 10240
  })
];

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
    .pipe(postcss(postCssPlugins))
    .pipe(sourcemaps.write('./stylemaps'))
    .pipe(gulp.dest('public/assets/stylesheets'))
    .pipe(browserSync.reload({stream: true}));
});

// svg-sprite for html(pug)
gulp.task('svg-sprite', function () {
  return gulp.src('src/assets/images/sprite-svg/*.svg')
  // minify svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // remove all fill and style declarations in out shapes
    .pipe(cheerio({
      run: function ($) {
        // $('[fill]').removeAttr('fill');
        // $('[stroke]').removeAttr('stroke');
        // $('[defs]').removeAttr('defs');
        // $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg",
          render: {
            scss: {
              dest: '../../../../src/assets/stylesheets/sprite-svg/_sprite-svg.scss',
              template: 'src/assets/stylesheets/sprite-svg/_sprite-template.scss'
            }
          },
          example: false
        }
      }
    }))
    .pipe(gulp.dest('public/assets/images/'));
});

// sprite png
gulp.task('sprite', function() {

  let spriteData = gulp.src('src/assets/images/sprite/*.png')
    .pipe(spritesmith({
      // retinaSrcFilter: ['src/assets/images/sprite/*@2x.png'], //for retina @2x
      imgName: 'sprite.png',
      // retinaImgName: 'sprite@2x.png', //for retina @2x
      cssName: 'sprite.scss',
      padding: 5,
      cssVarMap: function(sprite) {
        sprite.name = sprite.name;
      },
      imgPath: '../images/sprite.png',
      // retinaImgPath: '../images/sprite@2x.png' //for retina @2x
  }));
  let imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin({
      use: [pngquant()]
    }))
    .pipe(gulp.dest('public/assets/images/'));
  let cssStream = spriteData.css
    .pipe(gulp.dest('src/assets/stylesheets/sprite/'));
  return merge(imgStream, cssStream);
});

// css minify
gulp.task('cssnano', function () {
  return gulp.src('public/assets/stylesheets/*.css')
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
    // .pipe(browserSync.reload({stream: true}));
});

gulp.task('clean', function () {
  console.log('---------- Clean');
  return del(['public']);
});

//Copy JS
gulp.task('copyJs', function() {
  return gulp.src(['./src/assets/scripts/*vendor/**/*',
      './src/assets/scripts/*.js'])
    .pipe(gulp.dest('public/assets/scripts/'));
});

// Copy Fonts
gulp.task('copyFonts', function() {
  return gulp.src('./src/assets/fonts/**/*')
    .pipe(gulp.dest('public/assets/fonts/'));
});

// Copy Images
gulp.task('copyImages', function() {
  return gulp.src(
      [ 
        '!src/assets/images/sprite/',
        '!src/assets/images/sprite/**/*',
        '!src/assets/images/sprite-svg/',
        '!src/assets/images/sprite-svg/**/*',
        // '!src/assets/images/sprite.svg',
        'src/assets/images/**/*'
      ]
    )
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('public/assets/images/'));
});

// Copy temporary pictures
gulp.task('copyTempPics', function() {
    return gulp.src('./src/assets/temp/**/*')
    .pipe(gulp.dest('public/temp/'));
});
// Copy content
gulp.task('copyContent', function () {
  return gulp.src('./src/assets/content/**/*')
    .pipe(gulp.dest('public/assets/content'));
});

// Watch taskes
gulp.task('watch',['browser-sync'], function() {
  gulp.watch(['src/assets/stylesheets/*.scss',
              'src/assets/stylesheets/**/*.scss',
              'src/assets/stylesheets/**/**/*.scss',
              'src/templates/**/*.scss'], ['styles']);
  gulp.watch(['src/pages/*.pug',
              'src/pages/**/*.pug',
              'src/templates/**/*.pug',
              'src/templates/**/*.html'], ['pug']);
  gulp.watch(['src/assets/images/sprite-svg/*.svg'], ['svg-sprite']);
  gulp.watch(['src/assets/images/sprite/*.png'], ['sprite']);
  gulp.watch(['src/assets/fonts/*.*', 'src/assets/fonts/**/*.*'], ['copyFonts']);
  gulp.watch(['src/assets/scripts/*.*','src/assets/scripts/**/*.*'], ['copyJs']);
  gulp.watch(['src/assets/images/*.*', 'src/assets/images/**/*.*'], ['copyImages']);
  gulp.watch(['src/assets/temp/*.*', 'src/assets/temp/**/*.*'], ['copyTempPics']);
  gulp.watch(['src/assets/content/*.*', 'src/assets/content/**/*.*'], ['copyContent']);
});

gulp.task('default', function(callback) {
  runSequence(
    'clean',
    ['svg-sprite', 'sprite'],
    ['styles', 'pug', 'copyFonts', 'copyJs', 'copyImages', 'copyTempPics','copyContent', 'watch'],
    callback);
});