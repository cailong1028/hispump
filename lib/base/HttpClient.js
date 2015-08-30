/**
 * Created by cailong on 2015/8/19.
 */
/*global require, module*/
'use strict';
var log = require('./log');
var _ = require('underscore');
var http = require('http');
var querystring = require('querystring');

var HttpClient = function(){
	var self = this;
	this.init.apply(this,  Array.prototype.slice.call(arguments));
	var req = http.request(this.options, function(res) {
		res.setEncoding(self.encode);
		var responseString = '';
		res.on('data', function(data) {
			responseString += data;
			self.callback(data);
			log('HttpClient data: ' + responseString);
		});
		res.on('end', function() {
			log('HttpClient end: ' + responseString);
		});
		req.on('error', function(e) {
			log('HttpClient ERROR: ' + e);
		});
	});
	//write to body content! in REST, you had better do not use it in GET request
	if(this.bodyString){
		req.write(this.bodyString);
	}
	req.end();
};

_.extend(HttpClient.prototype, {
	defaultOptions: {
		host: 'localhost',
		port: 80,
		path: '/',
		method: 'GET',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
			//'Content-Type': 'application/json',
			//'Content-Length' : contents.length
		}
	},
	init: function(){
		if(arguments.length < 1){
			log('HttpClient ERROR: need argument');
		}
		var opts = arguments[0];
		if(arguments.length > 1 && typeof arguments[1] === 'function'){
			this.callback = arguments[1];
		}
		this.options = _.extend({}, this.defaultOptions, _.pick(opts, 'host', 'port', 'path', 'method'));
		this.options.method = this.options.method.toUpperCase();
		if(opts.method.toLowerCase() === 'get' && opts.query){
			this.queryString = querystring.stringify(opts.query);
			this.options.path += '?'+this.queryString;
		}else{
			if(opts.body){
				this.bodyString = JSON.stringify(opts.body);
				this.options.headers['Content-Length'] = this.bodyString.length
			}
		}
		if(opts.contentType){
			this.options.headers['Content-Type'] = opts.contentType;
		}

		this.encode = opts.encode;
	}
});

module.exports = HttpClient;
//方法调用实例
/*
 //GET
 new HttpClient({
 host: '127.0.0.1',
 port: 3000,
 path: '/test/lisi',
 method: 'GET',
 encode: 'UTF-8',
 query: {
 name: '张'
 }
 },
 function (data) {
 log('haha-->' + data);
 }
 );
 //POST
 new HttpClient({
 host: '127.0.0.1',
 port: 3000,
 path: '/upload',
 method: 'POST',
 encode: 'UTF-8',
 contentType: 'application/json',
 body: {
 dataType: 'CycleDrugSheetDetail',
 depID: '005',
 devID: '38-B1-DB-32-42-2D',
 dataTime: '2014-10-11 9:43:38',
 version: '1.0',
 appData: {
 ID: "id1",
 FormID: "aaa",
 DrugID: "bbb",
 IsCycle: "ccc",
 CycleDate: "ddd",
 CartCode: "eee",
 ISSYNC: "fff",
 SYNCSN: "ggg"
 }
 }
 },
 function (data) {
 log('haha-->' + data);
 }
 );
 */
