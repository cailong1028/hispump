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
	getDrugAppend: function(queryOptions){
		var dtd = new $def.Deferred();

		var sql = ' select operdate, expireddate, a.drugid, b.drugname, d.cartcode, d.cartname, reducecount, drugspec, oldvalue, drugcount, operate, c.username, c. name, b.suittype, b.vendor ';
		var from = ' from drugappend a left join druginfo b on a.drugid = b.drugid left join medcart d on d.cartcode = a.cartcode left join userinfo c on a.userid = c.userid ';
		var where = ' where 1 = 1 ';

		var values = [];
		var valuesCnt = [];
		if(queryOptions.cartid){
			var cartids = queryOptions.cartid.split(',');
			where += ' and a.cartcode in (';
			where += queryOptions.cartid.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(cartids, function(one){
				values.push(one);
				valuesCnt.push(one);
			});
		}
		if(queryOptions.drugid){
			var drugids = queryOptions.drugid.split(',');
			where += ' and a.drugid in (';
			where += queryOptions.drugid.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(drugids, function(one){
				values.push(one);
				valuesCnt.push(one);
			});
		}
		if(queryOptions.devType){
			var devTypes = queryOptions.devType.split(',');
			where += ' and d.type in (';
			where += queryOptions.devType.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(devTypes, function(one){
				values.push(one);
				valuesCnt.push(one);
			});
		}

		var whereSql = where + ' order BY a.SHEETID desc ';

		sql += from;
		sql += whereSql;
		var sqlTotal = 'select count(*) as cnt ';
		sqlTotal += from;
		sqlTotal += where;
		var returnJson = {content: [], page: {}};
		var queryTotalDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			returnJson.page.size = parseInt(queryOptions.size) || hismpc.defaultSize;
			returnJson.page.number = parseInt(queryOptions.page) || hismpc.defaultPage;
			returnJson.page.totalElements = result[0].cnt;
			returnJson.page.totalPages = parseInt(returnJson.page.totalElements / returnJson.page.size, 10) + 1;

			return dtd.resolve(returnJson);
		};
		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			returnJson.content = result;
			hismpc.query(sqlTotal, valuesCnt, queryTotalDone);
		};
		hismpc.queryPage(sql, values, queryOptions, queryDone);
		return dtd.promise();
	}
};

var DrugAppendBiz = extend(drugAppendProto, Biz);

module.exports = DrugAppendBiz;
