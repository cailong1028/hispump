/**
 * Created by cailong on 2015/8/21.
 */
/*global global, require, process, module*/
'use strict';
var $def = require('jquery-deferred');
var base = require('../base');
var log = base.log;
var hismpc = base.hismpc();
var mysql_conf = require('../../conf/mysql-cluster-conf');
var _ = require('underscore');

var beforeServerStart = function () {

	var dtd = new $def.Deferred();

	//env
	global.env = 'development';
	if (process.env.NODE_ENV && process.env.NODE_ENV) {
		global.env = process.env.NODE_ENV;
	}

	//TODO 如果是生产环境, 先替换生产环境配置文件,然后启动服务
	if (global.env === 'production') {

	}

	//Create mysql pool cluster
	base.hismpc();
	//Create redis pool
	base.hisrp();
	//TOT configure DB file copy


	//Check DB on start server
	var firstNodeName = _.keys(mysql_conf)[0],
		firstNode = mysql_conf[firstNodeName];
	hismpc.poolCluster.getConnection('master', function (err, conn) {
		if (err) {
			log('ERROR: Can not connect to DB: ');
			log('\t host: [' + firstNode.host + ']');
			log('\t port: [' + firstNode.port + ']');
			log('\t database: [' + firstNode.database + ']');
			log('\t FAIL TO STARTUP APP SERVER');
			return dtd.reject(err);
		}
		//Success
		dtd.resolve();
	});
	return dtd.promise();
};

module.exports = beforeServerStart;