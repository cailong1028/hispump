/**
 * Created by cailong on 2015/8/27.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
//extend
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