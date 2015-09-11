/**
 * Created by cailong on 2015/8/6.
 * 基础模块
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = function(){};


var UUID = base.UUID = require('./UUID');
var log = base.log = require('./log');
//使用redis pool 的方式 替代redis方式
//var hisredis = base.hisredis = require('./hisredis');
var hisrp = base.hisrp = require('./hisredis-pool');
var RedisSession = base.RedisSession = require('./hisredis-session');
//使用mysql-pool-cluster方式, 不使用hism和hismp方式
//var hism = base.hism = require('./hismysql');
//var hismp = base.hismp = require('./hismysql-pool');
var hismpc = base.hismpc = require('./hismysql-pool-cluster');
var Biz = base.Biz = require('./Biz');
var Dao = base.Dao = require('./Dao');
var HttpClient = base.HttpClient = require('./HttpClient');

var extend = base.extend = require('./extend');
var Events = base.Events = require('./Events');
var Dtd = base.Dtd = require('./Dtd');

var Watcher = base.Watcher = require('./Watcher');
var hrpp = base.hrpp = require('./httpRequestParamParse');

var Task = base.Task = require('./Task');






module.exports = base;


