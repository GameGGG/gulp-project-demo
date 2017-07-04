var gulp = require('gulp'),
	del = require('del'), // 文件删除模块
	fs = require('fs'),
	path = require('path'),
	merge = require('merge-stream'),
	rename = require('gulp-rename'),  // 文件重命名
	concat = require('gulp-concat'),  // 代码合并
	uglify = require('gulp-uglify'),  // 代码压缩
	revCollector = require('gulp-rev-collector'),
	rev = require('gulp-rev'),
	autoprefixer = require('gulp-autoprefixer'),
  usemin = require('gulp-usemin'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  config = require('./gulpconfig.js');


//  文件系统查询
function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}


// 拷贝图片任务
gulp.task('copyImg',function(){
	return gulp.src('./src/images/**/*')
				.pipe(gulp.dest('./dist/images/'));
})



// =========================暂未使用=========================
// 拷贝css任务
gulp.task('copyCss',function(){
	return gulp.src('./src/styles/**/*')
				.pipe(gulp.dest('./dist/styles/'))
})
// 拷贝js任务
gulp.task('copyJs',function(){
	return gulp.src('./src/javascripts/**/*')
				.pipe(gulp.dest('./dist/javascripts'))
})
// =========================暂未使用=========================




// 拷贝html任务
gulp.task('copyHtml',['scripts','styles'],function(){
	return gulp.src(['rev/**/*.json','./src/*.*'])
        .pipe(usemin())
				.pipe(revCollector())
				.pipe(gulp.dest('./dist'))
})
// 拷贝任务整合
gulp.task('copy',['copyImg','copyHtml'],function(){
	console.log('coye file is OK.');
	return true;
})


// 合并js代码
gulp.task('scripts',function(){
	var scriptsPath = "./src/javascripts"
	var folders = getFolders(scriptsPath);
	var tasks = folders.map(function(folder) {
      // 拼接成 foldername.js
      // 压缩
      // 重命名为 folder.min.js
      // 写入输出
      return gulp.src(path.join(scriptsPath, folder, '/*.js'))
        .pipe(concat(folder + '.js'))
        .pipe(uglify())
        .pipe(rename(folder + '.js'))
        .pipe(rev())
        .pipe(gulp.dest('./dist/javascripts'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
   });
   return merge(tasks);
})
// 合并css代码
gulp.task('styles',function(){
	var scriptsPath = "./src/styles"
	var folders = getFolders(scriptsPath);
	var tasks = folders.map(function(folder) {
      // 拼接成 foldername.css
      // 写入输出
      // 压缩
      // 重命名为 folder.min.css
      // 再一次写入输出
      return gulp.src(path.join(scriptsPath, folder, '/*.css'))
        .pipe(concat(folder + '.css')) 
        .pipe(rename(folder + '.css'))
        .pipe(rev())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false       
        }))
        .pipe(gulp.dest('./dist/styles'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
   });
   return merge(tasks);
})


// 编译sass任务
gulp.task('sass', function() {
    return gulp.src("src/scss/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("src/styles/"))
        .pipe(browserSync.reload({stream: true}));
});

// 编译ES6任务

// browserSync 动态刷新页面
// 静态服务器
gulp.task('browser-sync',['sass'], function() {
    browserSync.init({
        server: {
            baseDir: "./src"
        }
    });
});

// 清理dist目录任务
gulp.task('delFile',function(){
	return del(['./dist/**/*']);
})


gulp.task('build',['delFile','copy','scripts','styles'],function(){
	console.log('build success!');
})
gulp.task('dev',['browser-sync'],function(){
  // 监听文件改变
  gulp.watch("src/scss/**/*", ['sass']);
  gulp.watch("src/*.html").on('change',browserSync.reload);
  gulp.watch("src/styles/**/*").on('change',browserSync.reload);
  gulp.watch("src/javascripts/**/*").on('change',browserSync.reload);
  gulp.watch("src/images/**/*").on('change',browserSync.reload);
  console.log('start server is OK!')
})