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
//效期告警
var expiredWarnValueProto = {
	init: function(){},
	//根据条件查询告警列表
	loadExpiredWarnList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = "select aa.*, bb.SuitType, bb.DrugSpec, bb.DrugName, cc.CartName, bb.Vendor " +
			"  from (select DrugID, CartCode, ExpiredDate, SUM(drugstock) as drugstock " +
			"          from DrugBox " +
			"         WHERE storageFlag = '0' " +
			"           and  CONVERT(ExpiredDate, DATETIME) <=  date_add(now(), INTERVAL " +
			"                       CONVERT((SELECT PrmtName " +
			"                               FROM PRMT " +
			"                              WHERE PRMT.PRMTTYPE = 'WarnExpiryDate'), SIGNED ) DAY " +
			"                      )               " +
			"         group by DrugID, ExpiredDate, CartCode " +
			"        having(SUM(drugstock) > 0)) aa " +
			" inner join drugInfo bb " +
			"    on aa.DrugID = bb.DrugID " +
			" inner join MedCart cc " +
			"    on aa.CartCode = cc.CartCode " ;
		var where = " where bb.isDeleted = '0' ";

		var values = [];
		if(queryOptions.suitList && queryOptions.suitList != '0'){
			if(queryOptions.suitList == 'A') {
				where += "  AND bb.SuitType IN('瓶','支') ";
			} else {
				where += "  AND bb.SuitType NOT IN('瓶','支') ";
			}
		}
		if(queryOptions.drugName && queryOptions.drugName != '0' && queryOptions.drugName != '请输入药品简拼'){
			where += "  AND bb.DrugName LIKE '%?%' ";
			values.push(queryOptions.drugName);
		}
		if(queryOptions.cartCode && queryOptions.cartCode != '0'){
			where += " and cc.CartCode = ? ";
			values.push(queryOptions.cartCode);
		}

		if(queryOptions.beginTime && queryOptions.beginTime != '0'){
			where += " and aa.EXPIREDDATE >= ? ";
			values.push(queryOptions.beginTime);
		}

		if(queryOptions.endTime && queryOptions.endTime != '0'){
			where += " and aa.EXPIREDDATE <= ? ";
			values.push(queryOptions.endTime);
		}

		if(queryOptions.drugType && queryOptions.drugType != '0'){
			where += " and bb.drugType = ? ";
			values.push(queryOptions.drugType);
		}

		//if(queryOptions.drugList && queryOptions.drugList != '0'){
		//	where += " and bb.SUITTYPE = ? ";
		//	values.push(queryOptions.drugList);
		//}

		sql += where;
		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			dtd.resolve(result);
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	}
};

var ExpiredWarnBiz = extend(expiredWarnValueProto, Biz);

module.exports = ExpiredWarnBiz;
