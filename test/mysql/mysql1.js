/**
 * Created by cailong on 2015/8/18.
 */
'use strict';
/*global require, describe*/
var assert = require('assert');
var base = require('../../lib/base');
var UUID = base.UUID;
var hismpc = base.hismpc;
var log = base.log;
//var mocha = require('mocha');

describe('mysql test', function(){
	describe('query select', function(){
		it('simplest query by mysql pool cluster, return Array(type is object)', function(done){
			hismpc.query('select * from test', function(err, res, fileds){
				assert.equal('object', typeof res);
				done()
			});
		});
		it('test performing queries', function(done){
			hismpc.query('select * from test where id = ?',['zhangsan'],  function(err, results, fields){
				assert.equal('zhangsan', results[0].id);
				done();
			});
		});
		it('test insert by JSON', function(done){
			var id = new UUID();
			var insertObj = {id: id, name: 'mocha插入数据', age: 1, sex: '男'};
			hismpc.query('insert into test set ?', insertObj, function(err, res, fields){
				log('res is-->'+JSON.stringify(res));
				assert.equal(res.affectedRows, 1);
				done();
			});
		});
		//要么直接拼写,要么使用json方式,, 不要使用下面方式, 错误
		/*it('test insert by pre array', function(done){
			var id = new UUID();
			var name = '胡剑梅';
			var sex = '女';
			var age = 23;
			var arr = [id, name, sex, age];
			hismpc.query('insert into test values(?, ?, ?, ?)', arr, function(err, res, fields){
				log('res is-->'+JSON.stringify(res));
				assert.equal(res.affectedRows, 1);
				done();
			});
		})*/
		it('update by json', function(done){
			var id = 'zhangsan';
			var arr = [{name: '你想不到的名字'}, id];
			hismpc.query('update test set ? where id = ?', arr, function(err, res, fields){
				assert.equal('number', typeof res.affectedRows);
				hismpc.query('select * from test where id=?', id, function(err, res, f){
					assert.equal('你想不到的名字', res[0].name);
					done();
				});
			});
		});
	});
});