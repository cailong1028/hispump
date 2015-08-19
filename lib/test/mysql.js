/**
 * Created by cailong on 2015/8/18.
 */

var base = require('../base');
var UUID = base.UUID;
var log = base.log;
var mysql = require('mysql');
var hismpc = base.hismpc;

hismpc.query('select * from test', function (err, results, fields) {
	console.log('get results: ' + JSON.stringify(results));
});

var id = new UUID();
var insertObj = {id: id, name: 'mocha插入数据', age: 1, sex: '男'};
hismpc.query('insert into test set ?', insertObj, function(err, res, fields){
	log('res is-->'+JSON.stringify(res));
	hismpc.destroy();
});

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
	console.log(rows);
};
arr.push(sqlOpts);
arr.push(values);
arr.push(callback);
conn.query.apply(conn, arr);
conn.end();
*/
