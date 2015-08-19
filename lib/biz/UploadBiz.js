/**
 * Created by cailong on 2015/8/19.
 */
var base = require('../base');
var _ = require('underscore');
var redis_conf = require('../../conf/redis-conf');

var Biz = base.Biz;
var extend = base.extend;
var hisredis = base.hisredis;

var UploadBiz = extend({
	init: function(data){
		this.acceptData = data;
	},
	updateDB: function(){
		var data = _.clone(this.acceptData);
		//var tableName = data.dataType;
		//done ! to queue
		var queueId = redis_conf.upload_channel_name;
		hisredis.getRedisClient().lpush(queueId, JSON.stringify(data));
		return true;
	}
}, Biz);

module.exports = UploadBiz;
