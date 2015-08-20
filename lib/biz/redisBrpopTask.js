/**
 * Created by cailong on 2015/8/19.
 */
'use strict';
var base = require('../base');
var log = base.log;
//var hisredis = base.hisredis;
var hisrp = base.hisrp;
var redis_conf = require('../../conf/redis-conf');
var hismpc = base.hismpc;

var redisBrpopTask = function(){
	var uploadQueueId = redis_conf.upload_channel_name;
	log('aaaaaaaaaaaa');
	hisrp.brpop(uploadQueueId, 0, function(listName, item){
		//TODO 写入msql
		log('bbbbbbbbbbbbbb');
		if(!item){
			return;
		}
		var upload = JSON.parse(item[1]);
		var sql = 'update ?? set ? where id = ?';
		var values = [];
		values.push(upload.dataType);
		values.push(upload.appData);
		values.push(upload.appData.ID);

		hismpc.query(sql, values, function(err, res, fields){
			//TODO 更新完数据库后的操作
		});
		redisBrpopTask();
	});

};
module.exports = redisBrpopTask;