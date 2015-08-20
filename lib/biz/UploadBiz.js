/**
 * Created by cailong on 2015/8/19.
 */
var base = require('../base');
var log = base.log;
var _ = require('underscore');
var redis_conf = require('../../conf/redis-conf');

var Biz = base.Biz;
var extend = base.extend;
//var hisredis = base.hisredis;
var hisrp = base.hisrp;

var UploadBiz = extend({
	init: function(data){
		this.acceptData = data;
	},
	updateDB: function(callback){
		var data = this.acceptData;
		//done ! just lpush to queue
		var queueId = redis_conf.upload_channel_name;
		try{
			hisrp.lpush(queueId, JSON.stringify(data), function(err, listName, item){
				if(callback && typeof callback === 'function'){
					callback(err, listName, item);
				}
			});
		}catch(e){
			log('updateDB error: '+e);
			if(callback && typeof callback === 'function'){
				callback(new Error(e));
			}
		}
	}
}, Biz);

module.exports = UploadBiz;
