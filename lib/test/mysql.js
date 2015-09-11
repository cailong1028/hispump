/**
 * Created by cailong on 2015/8/18.
 */
/*global require*/
'use strict';
var $def = require('jquery-Deferred');
var _ = require('underscore');
var base = require('../base');
var log = base.log;
var UUID = base.UUID;
var hismpc = base.hismpc();

var q1 = function () {
	var dtd = new $def.Deferred();
	hismpc.query('select * from test', function (err, results, fields) {
		log.info('get results: ' + JSON.stringify(results));
		dtd.resolve();
	});
	return dtd.promise();
};

var id = new UUID();
var insertObj = {id: id, name: 'mocha插入数据', age: 1, sex: '男'};
var q2 = function () {
	var dtd = new $def.Deferred();
	hismpc.query('insert into test set ?', insertObj, function (err, res, fields) {
		log.info('res is-->' + JSON.stringify(res));
		dtd.resolve();
	});
	return dtd.promise();
};

var q3 = function () {
	var dtd = new $def.Deferred();
	hismpc.query('update test set ? where id=?', [{name: 'woqu2'}, '3'], function (err, res, fields) {
		dtd.resolve();
	});
	return dtd.promise();
};



//分页查询测试
var q4 = function () {
	var sql = 'select * from test';
	hismpc.queryPage(sql, function (err, res) {
		_.each(res, function (one) {
			log.info('q4-->'+JSON.stringify(one));
		});
	});
};

//分页查询测试
var q5 = function () {
	var sql = 'select * from test where name = ? ';
	hismpc.queryPage(sql, ['mocha插入数据'], function (err, res) {
		_.each(res, function (one) {
			log.info('q5-->'+JSON.stringify(one));
		});
	});
};

//分页查询测试
var q6 = function () {
	var sql = 'select * from test';
	hismpc.queryPage(sql, {page: 1, size: 5, orderBy: 'name', sort: 'desc'}, function (err, res) {
		_.each(res, function (one) {
			log.info('q6-->'+JSON.stringify(one));
		});
	});
};

//分页查询测试
var q7 = function () {
	var sql = 'select * from test where name = ?';
	hismpc.queryPage(sql, ['mocha插入数据'], {page: 1, size: 6, orderBy: 'name', sort: 'desc'}, function (err, res) {
		_.each(res, function (one) {
			log.info('q7-->'+JSON.stringify(one));
		});
	});
};

$def.when.apply($def, [q1(), q2(), q3()]).done(function () {
	//hismpc.destroy();
}).fail(function () {
	//hismpc.destroy();
});
q4();
q5();
q6();
q7();

/*
 var conn = mysql.createConnection({
 host: '192.168.62.130',
 port: 3306,
 database: 'hispump',
 user: 'cl',
 password: 'cl'
 });
 var arr = [];
 var sqlOpts = {
 sql: 'select * from test where id = ?',
 timeout: 4000,
 values: ['lisi']
 };
 var values = ['zhangsan'];
 var callback = function(err, rows){
 log.info(rows);
 };
 arr.push(sqlOpts);
 arr.push(values);
 arr.push(callback);
 conn.query.apply(conn, arr);
 conn.end();
 */
