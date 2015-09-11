/**
 * Created by cailong on 2015/8/18.
 */
/*global require*/
'use strict';
var _ = require('underscore');
var base = require('../base');
var log = base.log;
var UUID = base.UUID;
var hismpc = base.hismpc();

var id = new UUID();
var insertObj1 = {id: '3', name: 'trans插入数据', age: 1, sex: '男'};
var insertObj2 = {id: '4', name: 'trans插入数据', age: 1, sex: '男'};
var sql1 = 'insert into test set ?';
var sql2 = 'insert into test set ?';
var cb1 = function(err, res, fields){
	if(err){
		log.info('cb1 err-->'+err);
		//关闭测试程序使用, 项目中不要调用hismpc.destroy
		//return hismpc.destroy();
	}
	log.info('cb1 res is-->'+JSON.stringify(res));
};
var cb2 = function(err, res, fields){
	if(err){
		log.info('cb2 err-->'+err);
		//关闭测试程序使用, 项目中不要调用hismpc.destroy
		//return hismpc.destroy();
	}
	log.info('cb2 res is-->'+JSON.stringify(res));
};

var trans1CommitDone = function(err){
	log.info('trans done!');
	//关闭测试程序使用, 项目中不要调用hismpc.destroy
	//hismpc.destroy();
};

hismpc.getTrans().done(function(trans){
	trans.query(sql1, insertObj1, cb1)
		.query(sql2, insertObj2, cb2);

	trans.commit(trans1CommitDone);
}).fail(function(err){
	log.info(err);
});

var q3 = function(){
	hismpc.getTrans().done(function(trans){
		var sql3 = 'select * from test';
		var sql4 = 'select * from test where age = ?';
		var sql5 = 'select * from test where age = 1';
		var sql6 = 'select * from test where age = ?';
		trans.queryPage(sql3, function(err, res){
			_.each(res, function(one){
				log.info('q3-->'+JSON.stringify(one));
			});
		}).queryPage(sql4, [1], function(err, res){
			_.each(res, function(one){
				log.info('q4-->'+JSON.stringify(one));
			});
		}).queryPage(sql5, {orderBy: 'name', sort: 'desc', page: 1, size: 5}, function(err, res){
			_.each(res, function(one){
				log.info('q5-->'+JSON.stringify(one));
			});
		}).queryPage(sql6, [1], {sort: 'desc', size: 5}, function(err, res){
			_.each(res, function(one){
				log.info('q6-->'+JSON.stringify(one));
			});
		});
		trans.commit(function(err){

		});
	});
};

q3();