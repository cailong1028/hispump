/**
 * Created by cailong on 2015/8/19.
 */
/*	//方法调用实例
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
		callback: function (data) {
			log(data);
		}
	});
*/
'use strict';
var _ = require('underscore');
var http = require('http');
var querystring = require('querystring');

var HttpClient = function(){
	var self = this;
	this.init.apply(this,  Array.prototype.slice.call(arguments));
	this.contents = querystring.stringify(this.contents);

	this.options.headers["Content-Length"] = this.contents.length;

	var req = http.request(this.options, function(res) {
		res.setEncoding(self.encode);
		res.on('data', function (data) {
			self.callback(data);
		});
	});
	req.write(this.contents);
	req.end();
};

_.extend(HttpClient.prototype, {
	init: function(args){
		this.contents = args.contents;
		this.options = _.extend({
			host: 'localhost',
			port: 80,
			path: '/',
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
				//'Content-Type': 'application/json',
				//'Content-Length' : contents.length
			}
		}, args.options);
		this.encode = args.encode;
		this.callback = args.callback;
	}
});

module.exports = HttpClient;
