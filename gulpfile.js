"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const pug = require("gulp-pug");
const notify = require("gulp-notify");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const inlinesvg = require("postcss-inline-svg");
const imageInliner = require("postcss-image-inliner");
const svgo = require("postcss-svgo");
const objectFitImages = require("postcss-object-fit-images");
const cssnano = require("cssnano");
const browserSync = require("browser-sync");

const svgSprite = require("gulp-svg-sprite");
const svgmin = require("gulp-svgmin");
const cheerio = require("gulp-cheerio");
const replace = require("gulp-replace");

const buffer = require("vinyl-buffer");
const merge = require("merge-stream");
const imagemin = require("gulp-imagemin");
// const pngquant = require('imagemin-pngquant');
const spritesmith = require("gulp.spritesmith");

const newer = require("gulp-newer");
const del = require("del");

const pugInheritance = require("gulp-pug-inheritance");
const changed = require("gulp-changed");
const cached = require("gulp-cached");
const gulpif = require("gulp-if");
const filter = require("gulp-filter");
const rename = require("gulp-rename");
const concat = require("gulp-concat");

const gutil = require("gulp-util");
const ftp = require("vinyl-ftp");

const babel = require("gulp-babel");

let projectConfig = require("./project-config.json");
// let projectFtp = require("./project-ftp.json");
// let objectFTP = {
//   host: projectFtp.host,
//   user: projectFtp.user,
//   password: projectFtp.password,
//   parallel: 5,
//   log: gutil.log,
// };
// gulp.task("deploy", function () {
//   let conn = ftp.create(objectFTP);
//   let globs = projectFtp.localPathProject;
//   return gulp
//     .src(globs, { base: "./public", buffer: false })
//     .pipe(conn.differentSize(projectFtp.hostBasePath))
//     .pipe(conn.dest(projectFtp.hostBasePath));
// });

// gulp.task("ftp-clean", function () {
//   let conn = ftp.create(objectFTP);
//   return conn.clean(projectFtp.hostBasePath, ".", { base: "." });
// });

// Start browserSync server
gulp.task("browser-sync", function () {
  browserSync({
    server: {
      baseDir: "public",
    },
    port: 2000,
    open: true,
    notify: false,
  });
  browserSync.watch("public", browserSync.reload);
});

// postcss plugins
let postCssPlugins = [
  autoprefixer({ browsers: ["> 1%"], cascade: false }),
  inlinesvg(),
  svgo(),
  objectFitImages(),
  imageInliner({
    assetPaths: ["src/assets/images/bg-img/"],
    // Инлайнятся только картинки менее 5 Кб.
    maxFileSize: 5120,
  }),
];

// Styles
gulp.task("styles", function () {
  return gulp
    .src("src/assets/stylesheets/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on(
      "error",
      notify.onError(function (err) {
        return {
          title: "Styles compilation error",
          message: err.message,
        };
      })
    )
    .pipe(postcss(postCssPlugins))
    .pipe(sourcemaps.write("./stylemaps"))
    .pipe(gulp.dest("public/assets/stylesheets"));
  // .pipe(browserSync.stream());
});

// svg-sprite for html(pug)
gulp.task("svg-sprite", function () {
  return (
    gulp
      .src("src/assets/images/sprite-svg/*.svg")
      // minify svg
      .pipe(
        svgmin({
          js2svg: {
            pretty: true,
          },
        })
      )
      // remove all fill and style declarations in out shapes
      .pipe(
        cheerio({
          run: function ($) {
            // $('[fill]').removeAttr('fill');
            // $('[stroke]').removeAttr('stroke');
            // $('[defs]').removeAttr('defs');
            // $('[style]').removeAttr('style');
          },
          parserOptions: { xmlMode: true },
        })
      )
      // cheerio plugin create unnecessary string '&gt;', so replace it.
      .pipe(replace("&gt;", ">"))
      // build svg sprite
      .pipe(
        svgSprite({
          mode: {
            symbol: {
              sprite: "../sprite.svg",
              render: {
                scss: {
                  dest:
                    "../../../../src/assets/stylesheets/sprite-svg/_sprite-svg.scss",
                  template:
                    "src/assets/stylesheets/sprite-svg/_sprite-template.scss",
                },
              },
              example: false,
            },
          },
        })
      )
      .pipe(gulp.dest("public/assets/images/"))
  );
});

// sprite png

// css minify
gulp.task("cssnano", function () {
  return gulp
    .src("public/assets/stylesheets/*.css")
    .pipe(postcss([cssnano()]))
    .pipe(gulp.dest("public/assets/stylesheets"));
});

// Pug
gulp.task("pug", function () {
  return (
    gulp
      .src("src/templates/*.pug")
      // return gulp.src('./src/templates/**/*.pug')

      /* //only pass unchanged *main* files and *all* the partials
    .pipe(changed('public', { extension: '.html' }))

    //filter out unchanged partials, but it only works when watching
    .pipe(gulpif(global.isWatching, cached('pug')))

    //find files that depend on the files that have changed
    .pipe(pugInheritance({ basedir: 'src/templates/.' }))

    //filter out partials (folders and files starting with "_" )
    .pipe(filter(function (file) {
      return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    })) */
      //process pug templates
      .pipe(
        pug({
          pretty: true,
        })
      )
      .on(
        "error",
        notify.onError(function (err) {
          return {
            title: "Pug compilation error",
            message: err.message,
          };
        })
      )
      // save all the files

      .pipe(gulp.dest("public"))
  );
  // .pipe(browserSync.reload({ stream: true }));
});

gulp.task("clean", function () {
  console.log("---------- Clean");
  return del(["public"]);
});

//Copy JS
// gulp.task('copyJs', function () {
//   return gulp.src(['./src/assets/scripts/*vendor/**/*',
//     './src/assets/scripts/*.js',
//     "./node_modules/jquery/dist/jquery.min.js",
//     "./node_modules/jquery-migrate/dist/jquery-migrate.min.js",
//     "./node_modules/svg4everybody/dist/svg4everybody.js"])
//     .pipe(gulp.dest('public/assets/scripts/'));
// });

gulp.task("concatVendorJs", function () {
  return gulp
    .src(projectConfig.concatVendorJs)
    .pipe(concat("vendor.min.js"))
    .pipe(gulp.dest("public/assets/scripts"));
});
gulp.task("noConcatJs", function () {
  return gulp
    .src(projectConfig.noConcatJs)
    .pipe(gulp.dest("public/assets/scripts/"));
});
gulp.task("mainJs", function () {
  return gulp
    .src(projectConfig.mainJs)
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(concat("tools.min.js"))
    .pipe(gulp.dest("public/assets/scripts/"));
});

gulp.task("copyJs", gulp.parallel("concatVendorJs", "noConcatJs", "mainJs"));
// Copy Fonts
gulp.task("copyFonts", function () {
  return gulp
    .src("src/assets/fonts/**/*")
    .pipe(gulp.dest("public/assets/fonts/"));
});

// Copy Images
gulp.task("copyImages", function () {
  return gulp
    .src([
      "!src/assets/images/sprite-svg/",
      "!src/assets/images/sprite-svg/**/*",
      // '!src/assets/images/sprite.svg',
      "src/assets/images/**/*",
    ])
    .pipe(gulp.dest("public/assets/images/"));
});

// Optimization Images
gulp.task("optimizationImages", function () {
  return gulp
    .src([
      "!src/assets/images/sprite-svg/",
      "!src/assets/images/sprite-svg/**/*",
      // '!src/assets/images/sprite.svg',
      "src/assets/images/**/*",
    ])
    .pipe(newer("public/assets/images/"))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()],
      })
    )
    .pipe(gulp.dest("public/assets/images/"));
});

// Copy temporary pictures
gulp.task("copyTempPics", function () {
  return gulp
    .src(["src/assets/temp/**/*", "!src/assets/temp/README.md"])
    .pipe(gulp.dest("public/temp/"));
});
// Copy content
gulp.task("copyContent", function () {
  return gulp
    .src(["src/assets/content/**/*", "!src/assets/content/README.md"])
    .pipe(gulp.dest("public/assets/content"));
});

gulp.task("setWatch", function () {
  global.isWatching = true;
});

// Watch taskes
gulp.task("watch", function () {
  gulp.watch(
    [
      "src/assets/stylesheets/*.scss",
      "src/assets/stylesheets/**/*.scss",
      "src/assets/stylesheets/**/**/*.scss",
      "src/templates/**/*.scss",
    ],
    gulp.series("styles")
  );
  gulp.watch(
    ["src/templates/*", "src/templates/**/*.pug", "src/templates/**/*.html"],
    gulp.series("pug")
  );
  gulp.watch(["src/assets/images/sprite-svg/*.svg"], gulp.series("svg-sprite"));
  // gulp.watch(['src/assets/images/sprite/*.png'], gulp.series('sprite'));
  gulp.watch(
    ["src/assets/fonts/*.*", "src/assets/fonts/**/*.*"],
    gulp.series("copyFonts")
  );
  gulp.watch(
    ["src/assets/scripts/*", "src/assets/scripts/**/*"],
    gulp.series("copyJs")
  );
  gulp.watch(
    ["src/assets/images/*.*", "src/assets/images/**/*.*"],
    gulp.series("copyImages")
  );
  gulp.watch(
    ["src/assets/temp/*.*", "src/assets/temp/**/*.*"],
    gulp.series("copyTempPics")
  );
  gulp.watch(
    ["src/assets/content/*.*", "src/assets/content/**/*.*"],
    gulp.series("copyContent")
  );
});

gulp.task(
  "default",
  gulp.series(
    gulp.parallel("svg-sprite"),
    gulp.parallel(
      "styles",
      "copyFonts",
      "copyJs",
      "copyImages",
      "copyTempPics",
      "copyContent",
      "pug"
    ),
    gulp.parallel("watch", "browser-sync")
  )
);

gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel("svg-sprite"),
    gulp.parallel(
      "styles",
      "copyFonts",
      "copyJs",
      "optimizationImages",
      "copyTempPics",
      "copyContent",
      "pug"
    )
  )
);
