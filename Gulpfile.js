const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify'); //js代码压缩
const notify = require('gulp-notify'); //通知信息

let modules = {
	loaders: [{
		//这是处理es6文件
		test: /\.js$/,
		loader: 'babel-loader',
		exclude: /node_modules/,
		query: {
			presets: ['es2015',"stage-1"],
			plugins: ['transform-runtime',"transform-es2015-arrow-functions"]
		}
	}]
}

gulp.task('default', function() {
	return gulp.src('./index.js')
		.pipe(webpack({
			watch: true,
			output: {
				filename: 'parallax.js'
			},
			module: modules
		}))
		.pipe(gulp.dest('dest/'))
		.pipe(gulp.dest(path.join(path.resolve(), '/../../Documents/server/public')))
		.pipe(notify("<%= file.relative %> 成功生成!"));
});

gulp.task('min', function() {
	return gulp.src('./index.js')
		.pipe(webpack({
			watch: false,
			output: {
				filename: 'parallax.min.js'
			},
			module: modules
		}))
		.pipe(uglify())//生产的时候再启用压缩
		.pipe(gulp.dest('dest/'))
		.pipe(gulp.dest(path.join(path.resolve(), '/../../Documents/server/public')))
		.pipe(notify("<%= file.relative %> 成功生成!"));
});
