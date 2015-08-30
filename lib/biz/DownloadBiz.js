/**
 * Created by cailong on 2015/8/20.
 */
/*global require*/
'use strict';
var _ = require('underscore');
var base  = require('../base');
var hisrp = base.hisrp;
var extend = base.extend;

var DownloadBiz = extend({
	init: function(data){
		this.acceptData = data;
		//this.downloadData = this.acceptData.downloadData;
		//this.queueId = this.acceptData.queueId;
	},
	//需要下发数据,队列id
	//batch
	downloadData: function(){
		//根据数据所属科室,查找到下发到这个科室所有的智能终端对应的queue
		//lpush to redis
		//batch?
		//hisrp.lpush(this.acceptData.queueId, );
		//hisrp.lpush(this.acceptData.queueId, );
	}
}, base.Biz);

module.exports = DownloadBiz;


