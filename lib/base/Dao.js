/**
 * Created by cailong on 2015/9/7.
 */
/*global require*/
//just a interface
'use strict';
var _  = require('underscore');
var Dao = function(){
	this.init.apply(this, Array.prototype.slice.call(arguments));
};

//TODO attributes的设置
_.extend(Dao.prototype, {
	init: function(){}
});

module.exports = Dao;