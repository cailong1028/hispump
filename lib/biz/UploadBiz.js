/**
 * Created by cailong on 2015/8/19.
 */
/*global require*/
'use strict';
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
		var queueRivamed = redis_conf.upload_channel_rivamed_name;
		var queueHis = redis_conf.upload_channel_his_name;

		try{
			//可能这里也要改, 你看具体的数据
			if(data.toSys.indexOf('Rivamed') >= 0) {
				hisrp.lpush(queueRivamed, JSON.stringify(data), function(err, listName, item){
					if(callback && typeof callback === 'function'){
						callback(err, listName, item);
					}
				});
			}

			//TODO 改这里 to oracle queue
			//整理数据
			if(data.toSys.indexOf('HIS') > 0) {
				hisrp.lpush(queueHis, JSON.stringify(data), function (err, listName, item) {
					if (callback && typeof callback === 'function') {
						callback(err, listName, item);
					}
				});
			}
		}catch(e){
			log('updateDB error: '+e);
			if(callback && typeof callback === 'function'){
				callback(new Error(e));
			}
		}
	}
}, Biz);

module.exports = UploadBiz;
