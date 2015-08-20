/**
 * Created by cailong on 2015/8/6.
 * 基础模块
 */
/*global require*/
'use strict';
var base = function(){};

var extend = base.extend = require('./extend');
var UUID = base.UUID = require('./UUID');
var log = base.log = require('./log');
//使用redis pool 的方式 替代redis方式
var hisredis = base.hisredis = require('./hisredis');
var hisrp = base.hisrp = require('./hisredis-pool');
//使用mysql-pool-cluster方式, 不使用hism和hismp方式
//var hism = base.hism = require('./hismysql');
//var hismp = base.hismp = require('./hismysql-pool');
var hismpc = base.hismpc = require('./hismysql-pool-cluster');
var Biz = base.Biz = require('./Biz');
var HttpClient = base.HttpClient = require('./HttpClient');

module.exports = base;


