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
//滞留药品
var drugListProto = {
	init: function(){},
	//查询滞留药品
	getDrugReduce: function(queryOptions){
		var dtd = new $def.Deferred();
		var values = [];
		var sql = "SELECT " +
			"	a.ExpiredDate, " +
			"	( " +
			"		SELECT " +
			"			BoxName " +
			"		FROM " +
			"			Box " +
			"		WHERE " +
			"			BoxID = a.boxid " +
			"		LIMIT 1 " +
			"	) AS BOXNAME, " +
			"	( " +
			"		SELECT " +
			"			D.DrawerName " +
			"		FROM " +
			"			Box C " +
			"		INNER JOIN Drawer D ON C.DrawerCode = D.DrawerCode " +
			"		WHERE " +
			"			C.BoxID = a.boxid " +
			"		LIMIT 1 " +
			"	) AS DRAWERNAME, " +
			"	a.DrugID, " +
			"	a.DrugStock, " +
			"	DrugSpec, " +
			"	b.SuitType, " +
			"	b.DrugName, " +
			"	b.Vendor " +
			"FROM " +
			"	DrugBox a " +
			"INNER JOIN DrugInfo b ON a.DrugID = b.DrugID  ";
		if(queryOptions.where && queryOptions.where != '0') {
			sql += queryOptions.where;
		}
		sql += "ORDER BY DRAWERNAME ASC ";

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

var DrugListBiz = extend(drugListProto, Biz);

module.exports = DrugListBiz;
