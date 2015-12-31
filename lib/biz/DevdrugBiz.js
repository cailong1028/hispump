/**
 * Created by cailong on 2015/11/3.
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

var devdrugProto = {
	init: function(){},
	//add
	addDevdrug: function(devDrug){
		var dtd = new $def.Deferred();
		var uuid = new base.UUID();
		var createtime = new Date();
		_.extend(devDrug, {id: uuid, drugcartid: uuid, APPENDDATE: createtime});

		//check dev exists
		var sqlCheckDevDrug = 'select * from drugcart where drugid = ? and cartcode = ?';
		var sqlCheckDevDrugValues = [devDrug.drugid, devDrug.cartid];
		var checkDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			if(res.length > 0){
				return dtd.reject(0);
			}

			var sql = 'insert into drugcart set ?';
			var values = [devDrug];
			var commitDone = function(err){
				if(err){
					return dtd.reject(err);
				}
				dtd.resolve(devDrug);
			};
			hismpc.getTrans().done(function(trans){
				trans.query(sql, values);
				trans.commit(commitDone);
			}).fail(function(err){
				dtd.reject(err);
			});
		};
		hismpc.query(sqlCheckDevDrug, sqlCheckDevDrugValues, checkDone);

		return dtd.promise();
	},
	getDevdrugList: function(queryOptions){
		var dtd = new $def.Deferred();

		var sql = ' SELECT a.id as id, d.dept_name as deptname, d.dept_code as deptcode, c.cartname, c.id as cartid, b.drugname as drugname, b.drugid as drugid, b.drugspec, a.drugstock, b.suittype, a.drugwarning, a.drugoverflow as drugoverflow';
		var from = ' FROM drugcart a LEFT JOIN druginfo b ON a.drugid = b.drugid LEFT JOIN medcart c ON a.cartcode = c.cartcode left join fw_dept_dict d on c.dept_code = d.dept_code';
		var where = ' WHERE 1 = 1 ';

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
		if(queryOptions.deptid){
			where += ' and d.dept_code = ?';
			values.push(queryOptions.deptid);
			valuesCnt.push(queryOptions.deptid);
		}
		if(queryOptions.drugid){
			where += ' and a.drugid= ? ';
			values.push(queryOptions.drugid);
			valuesCnt.push(queryOptions.drugid);
		}
		if(queryOptions.drugwarning){
			where += ' and a.drugwarning = ?';
			values.push(queryOptions.drugwarning);
			valuesCnt.push(queryOptions.drugwarning);
		}
		if(queryOptions.drugoverflow){
			where += ' and a.drugoverflow = ?';
			values.push(queryOptions.drugoverflow);
			valuesCnt.push(queryOptions.drugoverflow);
		}

		var whereSql = where + ' order by deptname desc, cartname desc, drugname desc';

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
	},
	//modify
	modifyDevdrug: function(id, body){
		var self = this;
		var dtd = new $def.Deferred();
		var sql = 'update drugcart set ? where id = ?';
		var lastestmodifytime = new Date();
		var values = [_.pick(body, 'drugwarning', 'drugoverflow'), id];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(body);
			/*self.getDev(id).done(function(dev){
				dtd.resolve(dev);
			}).fail(function(){
				//已经更新成功, 只是查询失败了, 所以是resolve而不是reject
				dtd.resolve({});
			});*/
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	deleteDevdrug: function(devdrugid){
		var dtd = new $def.Deferred();
		var sqlDevdrug = 'delete from drugcart where id = ?';
		var valuesDevdrug = [devdrugid];
		var commitDone = function(err){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve();
		};
		hismpc.getTrans().done(function(trans){
			trans.query(sqlDevdrug, valuesDevdrug);
			trans.commit(commitDone);
		}).fail(function(err){
			dtd.reject(err);
		});
		return dtd.promise();
	}
};

var DevdrugBiz = extend(devdrugProto, Biz);

module.exports = DevdrugBiz;
