/**
 * Created by cailong on 2015/8/6.
 * 基础模块
 */
'use strict';
var base = function(){};

var extend = base.extend = require('./extend');
var UUID = base.UUID = require('./UUID');
var log = base.log = require('./log');
var hisredis = base.hisredis = require('./hisredis');

module.exports = base;


