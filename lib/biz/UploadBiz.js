/**
 * Created by cailong on 2015/8/19.
 */
/*global require, module*/
'use strict';
var base = require('../base');
var log = base.log;
var _ = require('underscore');
var redis_conf = require('../../conf/redis-conf');
var upload_queues_prefix = redis_conf['upload-queues-prefix'];
var upload_hispump_queue = redis_conf['upload-hispump-queue'];

var upload_hispup_queue_name = upload_queues_prefix + upload_hispump_queue;

var Biz = base.Biz;
var extend = base.extend;
var hisrp = base.hisrp;

var uploadBizProto = {
	init: function(data){
		this.acceptData = data;
	},
	_defaultData:{},
	invalidMsg: '',
	_checkData: function(data){
		var ret = true;
		this.invalidMsg = '';
		//TODO check data
		/*if(!data.){

		}*/
		return ret;
	},
	pushQueue: function(callback){
		if(!callback){
			log.info('ERROR: {UploadBiz}[pushQueue] need callback function arguments');
			return;
		}
		if(callback && typeof callback !== 'function'){
			log.info('ERROR:: the only one argument of {}UploadBiz}[pushQueue] should be a function');
			return;
		}
		var data = this.acceptData;

		if(!this._checkData(data)){
			return callback(new Error(this.invalidMsg));
		}
		//Just LPush to to-mysql queue
		try{
			return hisrp.lpush(upload_hispup_queue_name, JSON.stringify(data), function(err, listName, item){
				callback(err, listName, item);
			});
		}catch(e){
			//不可预知的系统级别错误
			log.info('updateDB error: '+e);
			return callback(new Error(e));
		}
	}
};

var UploadBiz = extend(uploadBizProto, Biz);

module.exports = UploadBiz;
