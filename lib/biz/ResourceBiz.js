/**
 * Created by cailong on 2015/9/10.
 */
/*global require, module*/
'use strict';

var base = require('../base');
var $def = require('jquery-deferred');
var hismpc = base.hismpc;
var log = base.log;

var resourceBizProto = {
	getAll: function(){
		var dtd = new $def.Deferred();
		var sql = 'select id, name, code, url, memo, type from resource';
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res);
		};
		hismpc.query(sql, queryDone);
		return dtd.promise();
	}
};

var ResourceBiz = base.extend(resourceBizProto, base.Biz);

module.exports = ResourceBiz;