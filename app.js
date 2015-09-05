/*global require, module, process*/
'use strict';

var _ = require('underscore');
//var $def = require('jquery-deferred');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var base = require('./lib/base');
var log = base.log;
//routers
var routes = require('./lib/routes/index');
var users = require('./lib/routes/users');
var upload = require('./lib/routes/upload');

var base = require('./lib/base');
var redisBrpopTask = require('./lib/task/redisBrpopTask');
var RedisBrpopTask = require('./lib/task/RedisBrpopTask2');
var downloadTask = require('./lib/task/downloadTask');
var DownloadTask = require('./lib/task/DownloadTask2');

var app = express();

//
var beforeServerStartTask = require('./lib/task/beforeServerStartTask');
//TODO use dtd to control when it is done

var appServer = function(){
	// view engine setup
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');

	// uncomment after placing your favicon in /public
	//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
	//app.use(logger('dev'));
	//use log4js replace morgan
	app.use(log4js.connectLogger(log, { level: 'auto'}));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));

	app.use('/', routes);
	app.use('/users', users);
	app.use('/upload', upload);

	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.use(function (err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: err
			});
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
	afterSetAppServer();
};

beforeServerStartTask().done(appServer).fail(function () {
	process.exit(1);
});

var afterSetAppServer = function(){
	var watcher = new base.Watcher();

	var downloadTask = new DownloadTask();
	downloadTask.run();

	var redisBrpopTask = new RedisBrpopTask();
	redisBrpopTask.run();

	watcher.addTask(downloadTask);
	watcher.addTask(redisBrpopTask);
	//redisBrpopTask();
	//downloadTask();
	/*var dbScanTask = require('./lib/task/dbScanTask');
	 dbScanTask();*/
};

module.exports = app;
