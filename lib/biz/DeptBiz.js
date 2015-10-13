/**
 * Created by cailong on 2015/9/14.
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

var deptProto = {
	init: function(){},
	//dept list
	getDeptList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = 'select id, name, createtime from dept';
		var values = [];
		var sqlTotal = 'select count(*) as cnt from dept';
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
			hismpc.query(sqlTotal, queryTotalDone);
		};
		hismpc.queryPage(sql, values, queryOptions, queryDone);
		return dtd.promise();
	},
	addDept: function(dept){
		var dtd = new $def.Deferred();
		var uuid = new base.UUID();
		var createtime = new Date();
		_.extend(dept, {id: uuid, createtime: createtime});


		var sqlCheck = 'select id from dept where name = ?';
		var valuesCheck = [dept.name];
		var sql = 'insert into dept set ?';
		var values = [dept];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(dept);
		};
		var checkDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			if(res.length > 0){
				return dtd.reject(0);
			}
			hismpc.query(sql, values, queryDone);
		};
		hismpc.query(sqlCheck, valuesCheck, checkDone);
		return dtd.promise();
	},
	modifyDept: function(id, body){
		var self = this;
		var dtd = new $def.Deferred();
		var sql = 'update dept set ? where id = ?';
		var values = [body, id];
		var sqlCheck = 'select name from dept where name = ?';
		var valuesCheck = [body.name];
		var currDept;
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			self.getDept(id).done(function(dept){
				dtd.resolve(dept);
			}).fail(function(){
				//已经更新成功, 只是查询失败了, 所以是resolve而不是reject
				dtd.resolve({});
			});
		};
		var checkDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			if(res.length > 0 && currDept.name !== body.name){
				return dtd.reject(0);
			}
			hismpc.query(sql, values, queryDone);
		};
		this.getDept(id).done(function(retDept){
			currDept = retDept;
			hismpc.query(sqlCheck, valuesCheck, checkDone);
		}).fail(function(err){
			return dtd.reject(err);
		});

		return dtd.promise();
	},
	getDept: function(id){
		var dtd = new $def.Deferred();
		var sql = 'select id, name, createtime from dept where id = ?';
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res[0]);
		};
		hismpc.query(sql, [id], queryDone);
		return dtd.promise();
	},
	deleteDept: function(deptid){
		var dtd = new $def.Deferred();
		var sqlDept = 'delete from dept where id = ?';
		var valuesDept = [deptid];
		//dev 的 deptid设置为0, 表示未分配
		var sqlDev = 'update dev set deptid = 0 where deptid = ?';
		var valuesDev = [deptid];
		var commitDone = function(err){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve();
		};
		hismpc.getTrans().done(function(trans){
			trans.query(sqlDept, valuesDept)
				.query(sqlDev, valuesDev);
			trans.commit(commitDone);
		}).fail(function(err){
			dtd.reject(err);
		});
		return dtd.promise();
	}
};

var DeptBiz = extend(deptProto, Biz);

module.exports = DeptBiz;
