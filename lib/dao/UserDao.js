/**
 * Created by cailong on 2015/9/7.
 */
/*global require, module*/
'use strict';
var base = require('../base');
var Dao = base.Dao;
var extend = base.extend;
var _ = require('underscore');

var attributes = {id: null, name: null};

var UserDaoProto = {
	init: function(opts){
		this.options = opts;
	}
};

_.extend(UserDaoProto, attributes);

var UserDao = extend(UserDaoProto, Dao);

module.exports = UserDao;