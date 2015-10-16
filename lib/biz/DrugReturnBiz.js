/**
 * Created by cailong on 2015/9/13.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hismpc = base.hismpc;
var $def = require('jquery-deferred');
//安瓶盘点
var drugReturnProto = {
	init: function(){}
};

var DrugReturnBiz = extend(drugReturnProto, Biz);

module.exports = DrugReturnBiz;
