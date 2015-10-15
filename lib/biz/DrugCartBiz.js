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
//库存盘点
var drugCartProto = {
	init: function(){},
	//查询药车
	loadDrugCartByCartCode: function(queryOptions){
		var dtd = new $def.Deferred();
		var values = [];
		var sql = "select A.DrugID,A.Vendor,a.DrugName,a.DrugSpec,a.SuitType,B.DrugBase,B.DrugStock  from V_DrugInfo_Detail A,(select DrugID,SUM(DrugBase) as DrugBase,SUM(DrugStock) as DrugStock from DrugBox where " ;
		if(queryOptions.cartCode && queryOptions.cartCode != '0'){
			sql += " CartCode = ? and ";
			values.push(queryOptions.cartCode);
		}
		sql += " isDeleted = '0' and StorageFlag in ('0','1') group by DrugID) as B";
		sql += " where A.DrugID = B.DrugID";
		if(queryOptions.suitList && queryOptions.suitList != '0'){
			if(queryOptions.suitList == 'A') {
				sql += "  AND A.SuitType IN('瓶','支') ";
			} else {
				sql += "  AND A.SuitType NOT IN('瓶','支') ";
			}
		}


		if(queryOptions.drugName && queryOptions.drugName != '0' && queryOptions.drugName != '请输入药品简拼'){
			sql += "  AND A.DrugName LIKE '%?%' ";
			values.push(queryOptions.drugName);
		}
		//排序
		sql += " ORDER BY A.DrugName";

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

var DrugCartBiz = extend(drugCartProto, Biz);

module.exports = DrugCartBiz;
