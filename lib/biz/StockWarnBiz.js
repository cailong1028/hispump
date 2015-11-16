/**
 * Created by cailong on 2015/9/13.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var moment = require('moment');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hismpc = base.hismpc;
var $def = require('jquery-deferred');
//库存告警
var stockWarnValueProto = {
	init: function(){},
	//查询全部告警列表
	loadAllStockWarnList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = 'select M.cartname, M.cartcode, ' +
			'       I.drugid, ' +
			'       I.drugname, ' +
			'       I.vendor, ' +
			'       I.drugspec, ' +
			'       I.suittype, ' +
			'       B.drugstock, B.drugoverflow ' +
			'  FROM DrugInfo I, ' +
			'       (SELECT Dc.drugid, Dbb.DrugStock, Dc.CartCode, Dc.drugoverflow ' +
			'          FROM DrugCart Dc ' +
			'          LEFT JOIN (SELECT CartCode, DrugID, SUM(DrugStock) DrugStock ' +
			'                      from DrugBox ' +
			'                     group by CartCode, DrugID) Dbb ' +
			'            on Dc.DrugID = Dbb.DrugID ' +
			'           and Dc.CartCode = Dbb.CartCode ' +
			'         where DrugWarning >= Dbb.Drugstock ' +
			'           AND (Dc.isDeleted = 0 or Dc.isDeleted is null)) B, ' +
			'       MedCart M ' +
			' WHERE I.DRUGID = B.DRUGID ' +
			'   and B.CartCode = M.CartCode ';

		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			dtd.resolve(result);
		};
		hismpc.query(sql, queryDone);
		return dtd.promise();
	},

	//根据条件查询告警列表
	loadStockWarnList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = 'SELECT I.drugid, ' +
			'       I.drugname, ' +
			'       I.drugspec, ' +
			'       I.suittype, ' +
			'       I.vendor, ' +
			'       B.drugstock, B.drugoverflow,' +
			'       M.cartname, M.cartcode ' +
			'  FROM (SELECT Dc.drugid, Dbb.DrugStock, Dc.CartCode, Dc.drugoverflow ' +
			'          FROM (SELECT CartCode, DrugID, DrugStock, DrugWarning, drugoverflow ' +
			'                  FROM DrugCart ' +
			'                 WHERE 1 = 1 ' +
			'                   AND isDeleted = 0) Dc ' +
			'          LEFT JOIN (SELECT DrugID, SUM(DrugStock) DrugStock ' +
			'                      from DrugBox ' +
			'                     group by DrugID) Dbb ' +
			'            on Dc.DrugID = Dbb.DrugID ' +
			'         WHERE Dc.DrugWarning >= Dbb.Drugstock) B ' +
			'  LEFT JOIN DrugInfo I ' +
			'    On B.DRUGID = I.DRUGID ' +
			'  left join MedCart M ' +
			'    On B.CartCode = M.CartCode ';

		var where = '  WHERE 1=1  ';

		var values = [];
		if(queryOptions.cartCode) {
			where += ' and CartCode = ? ';
			values.push(queryOptions.cartCode);
		}

		if(queryOptions.drugid){
			var drugids = queryOptions.drugid.split(',');
			where += ' and b.drugid in (';
			where += queryOptions.drugid.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(drugids, function(one){
				values.push(one);
			});
		}
		if(queryOptions.devType){
			var devTypes = queryOptions.devType.split(',');
			where += ' and m.type in (';
			where += queryOptions.devType.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(devTypes, function(one){
				values.push(one);
			});
		}

		if(queryOptions.cartCode && queryOptions.cartCode != '0'){
			where += ' and B.CartCode = ? ';
			values.push(queryOptions.cartCode);
		}

		if(queryOptions.beginTime && queryOptions.beginTime != '0'){
			where += ' and B.EXPIREDDATE >= ? ';
			values.push(queryOptions.beginTime);
		}

		if(queryOptions.endTime && queryOptions.endTime != '0'){
			where += ' and B.EXPIREDDATE <= ? ';
			values.push(queryOptions.endTime);
		}

		if(queryOptions.drugType && queryOptions.drugType != '0'){
			where += ' and B.drugType = ? ';
			values.push(queryOptions.drugType);
		}

		//if(queryOptions.drugList && queryOptions.drugList != '0'){
		//	where += ' and B.SUITTYPE = ? ';
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
	},

	//生成补药清单
	generateAppendSheet: function(){
		var dtd = new $def.Deferred();

		var generateOne = function(oneWarn){
			var dtd2 = new $def.Deferred();
			//查询是否存在还没有完成的补药清单
			var querySql = 'select * from appendsheet where cartcode = ? and drugid = ? and sheetstatus != \'6\'';
			var queryValues = [oneWarn.cartcode, oneWarn.drugid];
			hismpc.query(querySql, queryValues, function(err, result){
				if(err){
					//终止词条记录的操作, 不使用reject的原因是, 不要因为一条记录的错误, 就不生成其他的清单
					dtd2.resolve();
				}
				//根据查询出来的数据, 判定
				if(result.length === 0){
					//清单类型id号
					var uuid = new base.UUID();
					//清单类型, 0: 药品 10: 耗材
					var sheettype = '0';
					var sheetid = moment().format('YYYYMMDD') + 'S' + sheettype;
					//药品基数
					//var drugbase
					//补药数量
					var drugcount = parseInt(oneWarn.drugoverflow)  - parseInt(oneWarn.drugstock);
					//实际不要数量, insert的时候默认0
					var factcount = 0;
					//想指定药车发送
					var smartcode = oneWarn.cartcode;
					//发起者是hispump
					var userid = req.session.profile.id;
					var syncsn = 'hispump';
					var insertObj = {id: uuid, sheetid: sheetid, cartcode: oneWarn.cartcode, drugid: oneWarn.drugid,
						drugstock: oneWarn.drugstock, drugcount: drugcount, sheetstatus: '0', factcount: factcount,
						userid: userid, smartcode: smartcode, syncsn: syncsn};
					var insertSql = 'insert into appendsheet set ?';
					hismpc.query(insertSql, [insertObj], function(err, result){
						if(err){
							return dtd2.resolve();
						}
						return dtd2.resolve();
					});
				}else{
					//还有未完成补药的清单, 不再生成
					dtd2.resolve();
				}
			});
			return dtd2.promise();
		};

		var generateAllDone = function(){
			dtd.resolve();
		};

		var getWarnlistDone = function(warnList){
			if(warnList.length === 0){
				return dtd.resolve();
			}
			var defs = [];
			_.each(warnList, function(oneWarn){
				defs.push(generateOne(oneWarn));
			});
			$def.when.apply($def, defs).done(generateAllDone).fail(function(){
				dtd.reject(500);
			});
		};
		this.loadAllStockWarnList().done(getWarnlistDone).fail(function(err){
			dtd.reject(500);
			return;
		});
		return dtd.promise();
	}
};

var StockWarnBiz = extend(stockWarnValueProto, Biz);

module.exports = StockWarnBiz;
