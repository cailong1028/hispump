/**
 * Created by cailong on 2015/8/7.
 */
/*global require*/
'use strict';
var log4js = require('log4js');
var log4js_conf = require('../../conf/log4js-conf');
/*var defaultConf = {
	"appenders": [
		{"type": "console"},
		{
			"type": "file",
			"filename": "d:/workspace/hispump/log/hispump.log",
			"maxLogSize": 2048000,
			"backups": 100,
			"category": "hispump-logger"
		},
		{
			"type": "file",
			"absolute": true,
			"filename": "d:/workspace/hispump/log2/hispump.log",
			"maxLogSize": 20480,
			"backups": 10,
			"category": "hispump-logger2"
		}
	]
};*/
log4js.configure(log4js_conf/* || defaultConf*/, {reloadSecs: 300});
var logger = log4js.getLogger('hispump-logger');

module.exports = logger;