/**
 * Created by cailong on 2015/9/13.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var _s = require('underscore.string');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hismpc = base.hismpc;
var $def = require('jquery-deferred');

var drugProto = {
	init: function(){},
	//suggest drug list
	suggestDrugList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = 'select a.drugid as id , a.drugname as name, a.pinyin as pinyin ';
		var from =	' from druginfo a ';
		var where = ' where 1 = 1 ';

		var values = [];

		if(queryOptions.term){
			where += ' and (a.drugname like ? or a.pinyin like ?) ';
			values.push('%'+queryOptions.term.toUpperCase()+'%');
			values.push('%'+queryOptions.term.toUpperCase()+'%');
		}

		sql += from;
		sql += where;
		var returnJson = [];
		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			returnJson = result;
			return dtd.resolve(returnJson);
		};
		hismpc.queryPage(sql, values, queryOptions, queryDone);
		return dtd.promise();
	}
};

var DrugBiz = extend(drugProto, Biz);

module.exports = DrugBiz;
