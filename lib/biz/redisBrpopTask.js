/**
 * Created by cailong on 2015/8/19.
 */
/*global require*/
'use strict';
var base = require('../base');
var log = base.log;
//var hisredis = base.hisredis;
var hisrp = base.hisrp;
var redis_conf = require('../../conf/redis-conf');
var hismpc = base.hismpc;

var redisBrpopTask = function(){
	var uploadQueueId = redis_conf.upload_channel_rivamed_name;
	hisrp.brpop(uploadQueueId, 0, function(err, listName, item){
		if(err){
			//log();
			return redisBrpopTask();
		}
		if(!item){
			return redisBrpopTask();
		}
		var upload;
		try{
			upload = JSON.parse(item[1]);
		}catch(e){
			log('JSON parse ERROR: '+e);
			return redisBrpopTask();
		}

		if(!upload.dataType){
			log('invalid upload data, poped without update DB');
			return redisBrpopTask();
		}
		var sql = 'update ?? set ? where id = ?';
		var values = [];
		//判断具体操作
		switch (upload.OperateType) {
			case 'Insert' :
				sql = 'insert into ?? SET ?';
				values.push(upload.dataType);
				values.push(upload.RivamedappData);
				break;
			case 'Update' :
				sql = 'update ?? set ? where id = ?';
				values.push(upload.dataType);
				values.push(upload.RivamedappData);
				values.push(upload.RivamedappData.ID);
				break;
			default :
				values.push(upload.dataType);
				values.push(upload.RivamedappData);
				values.push(upload.RivamedappData.ID);
		}
		//入库操作
		hismpc.query(sql, values, function(err, res, fields){
			//更新完数据库后的操作, 如果失败回滚数据到队列头,
			if(err){
				//失败了,并且再将数据添加会队列头之后, 依然继续
				hisrp.lpush(uploadQueueId, item[1], function(err, listName, item2){
					// (TODO 暂时没有对回查回队列头失败的操作)
					/*if(callback && typeof callback === 'function'){
					 callback(err, listName, item2);
					 }*/
					redisBrpopTask();
				});
			}else{
				//成功则继续
				redisBrpopTask();
			}
		});
	});

};
module.exports = redisBrpopTask;