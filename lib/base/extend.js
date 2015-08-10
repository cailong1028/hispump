/**
 * Created by cailong on 2015/8/6.
 * 一个类的继承方法, 用法如下
 * <pre>
 *     var extend = require('path/to/extendModel')
 *     var A = function(){};
 *     A.extend = extend;
 *     var AA = A.extend();
 *     var aa = new AA();
 * </pre>
 *
 */
'use strict';
var _  = require('underscore');

var extend = function(protoProps){
	protoProps = protoProps || {};
	var Parent = this;
	var Child = function(){
		Parent.apply(this, Array.prototype.slice.call(arguments));
	};
	var parentInstance = new Parent;
	for(var key in parentInstance){
		if(Object.prototype.hasOwnProperty.call(parentInstance, key)) delete parentInstance[key];
	}
	_.extend(Child.prototype = parentInstance, protoProps);//不要使用 _.extend(child.prototype, parentInstance, protoProps); 因为_.extend只会clone ownPrototype
	//使用_.extend(prototype, props)的方式代替prototype = props的方式, 应为prototype = props的方式, 会改变对象的constructor,
	//但在继承的情况下只能使用Child.prototye = new Parent(), 此时就需要手动设置其constructor属性,如下
	//这样的实现,使对象可以精确定位到他所属的类
	Child.prototype.constructor = Child;
	//实现级联继承
	Child.extend = extend;
	return Child;
};

module.exports = extend;