/**
 * Created by cailong on 2015/11/4.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var _s = require('underscore.string');
var base = require('../../base');
var hrpp = base.hrpp;
var hismpc = base.hismpc;
var DrugBiz = require('../../biz/DrugBiz');

var drugRouter = function(){

	//列表suggest
	this.get('/drug/list/suggest', function(req, res, next){

		var query = hrpp(req).query;
		var queryOptions = {};

		if(!query.term || _s.trim(query.term) === ''){
			res.status = 500;
			return res.json({statusCode: 500});
		}

		_.extend(queryOptions, {term: query.term});
		_.extend(queryOptions, {size: 10});
		_.extend(queryOptions, {page: 0});

		var drugBiz = new DrugBiz();
		drugBiz.suggestDrugList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev list'});
		});
	});

};

module.exports = drugRouter;
