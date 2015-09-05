/**
 * Created by cailong on 2015/8/18.
 */
/*global require*/
'use strict';
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
		return hismpc.destroy();
	}
	log.info('cb1 res is-->'+JSON.stringify(res));
};
var cb2 = function(err, res, fields){
	if(err){
		log.info('cb2 err-->'+err);
		//关闭测试程序使用, 项目中不要调用hismpc.destroy
		return hismpc.destroy();
	}
	log.info('cb2 res is-->'+JSON.stringify(res));
};

var trans1CommitDone = function(err){
	log.info('trans done!');
	//关闭测试程序使用, 项目中不要调用hismpc.destroy
	hismpc.destroy();
};

hismpc.getTrans().done(function(trans){
	trans.query(sql1, insertObj1, cb1)
		.query(sql2, insertObj2, cb2);

	trans.commit(trans1CommitDone);
}).fail(function(err){
	log.info(err);
});

