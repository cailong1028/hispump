/**
 * Created by cailong on 2015/8/19.
 */
/*global require*/
//just a interface
'use strict';
var _  = require('underscore');
var Biz = function(){
	this.init.apply(this, Array.prototype.slice.call(arguments));
};

//TODO
_.extend(Biz.prototype, {
	init: function(){}
});

module.exports = Biz;