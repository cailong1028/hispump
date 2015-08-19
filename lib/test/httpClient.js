/**
 * Created by cailong on 2015/8/19.
 */
'use strict';
var http = require('http');
var querystring = require('querystring');
var base = require('../base');
var HttpClient = base.HttpClient;
var log = base.log;

var httpClient = new HttpClient({
	options: {
		host: '127.0.0.1',
		port: 3000,
		path: '/test',
		method: 'GET'
	},
	contents: {
		id: 1,
		name: 'cailong'
	},
	encode: 'UTF-8',
	callback: function(data){
		log(data);
	}
});

/*
var contents = querystring.stringify({
	name: 'cdu09',
	email: 'cdu09@qq.com'
});

var options = {
	host: '127.0.0.1',
	port: 3000,
	path: '/test',
	method: 'GET',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		//'Content-Type': 'application/json',
		'Content-Length' : contents.length
	}
};

var req = http.request(options, function(res) {
	res.setEncoding('UTF-8');
	res.on('data', function (data) {
		console.log(data);
	});
});

req.write(contents);
req.end();*/
