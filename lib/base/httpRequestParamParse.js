/**
 * Created by cailong on 2015/9/8.
 */
/*global require, module*/
'use strict';
var log = require('./log');
var _ = require('underscore');
var url = require('url');

//this should be request
var hrpp = function(req){
	var obj = {
		params: {},
		query: {},
		body: {}
	};

	obj.params = req.params;
	obj.query = url.parse(req.url, true).query;
	obj.body = req.body;
	return	obj;
};

module.exports = hrpp;