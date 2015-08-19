/**
 * Created by cailong on 2015/8/19.
 */
'use strict';
var base = require('../base');
var hisredis = base.hisredis;
var redis_conf = require('../../conf/redis-conf');
var hismpc = base.hismpc;

var redisBrpopTask = function(){
	var uploadQueueId = redis_conf.upload_channel_name;
	hisredis.getRedisClient().brpop([uploadQueueId, 0], function(listName, item){
		//TODO 写入msql
		var upload = JSON.parse(item[1]);
		var tableName = upload;
		hismpc.query('', function(){

		});
		redisBrpopTask();
	});

};
module.exports = redisBrpopTask;