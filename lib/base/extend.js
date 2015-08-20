/**
 * Created by cailong on 2015/8/6.
 * 一个类的继承方法, 用法如下
 * <pre>
 *     var extend = require('path/to/extendModel')
 *     var A = function(){};
 *     A.extend = extend;
 *     var AA = A.extend();
 *     var aa = new AA();
 *     或者
 *     var AA = extend({}, A);
 * </pre>
 */
/*global require*/
'use strict';
var _  = require('underscore');

var extend = function(protoProps, ctx){
	protoProps = protoProps || {};
	var Parent = ctx || this;
	var Child = function(){
		Parent.apply(this, Array.prototype.slice.call(arguments));
	};
	var parentInstance = new Parent;
	for(var key in parentInstance){
		if(Object.prototype.hasOwnProperty.call(parentInstance, key)) delete parentInstance[key];
	}
	_.extend(Child.prototype = parentInstance, protoProps);
	Child.prototype.constructor = Child;
	//级联继承
	Child.extend = extend;
	return Child;
};

module.exports = extend;