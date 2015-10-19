/**
 * Created by cailong on 2015/9/13.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hismpc = base.hismpc;
var $def = require('jquery-deferred');
//补药记录
var drugAppendProto = {
	init: function(){},
	//查询补药记录
	getDrugReduceSummary : function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = "SELECT " +
			"	OperDate, " +
			"	ExpiredDate, " +
			"	a.DrugID, " +
			"	b.DrugName, " +
			"	ReduceCount, " +
			"	DrugSpec, " +
			"	OldValue, " +
			"	DrugCount, " +
			"	Operate, " +
			"	c.UserName, " +
			"	c. NAME, " +
			"	b.SuitType, " +
			"	b.Vendor " +
			"FROM " +
			"	DrugAppend a " +
			"LEFT JOIN DrugInfo b ON a.DrugID = b.DrugID " +
			"LEFT JOIN UserInfo c ON a.UserID = c.UserID ";
		if(queryOptions.where && queryOptions.where != '0') {
			sql += queryOptions.where;
		}

		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			dtd.resolve(result);
		};
		hismpc.query(sql, queryDone);
		return dtd.promise();
	}
};

var DrugAppendBiz = extend(drugAppendProto, Biz);

module.exports = DrugAppendBiz;
