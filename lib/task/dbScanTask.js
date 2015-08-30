/**
 * Created by cailong on 2015/8/19.
 */
/*global require, module*/
'use strict';
var base = require('../base/index');
var schedule = require("node-schedule");
var log = base.log;
//var hisredis = base.hisredis;
var hisrp = base.hisrp;
var redis_conf = require('../../conf/redis-conf');
var db_scan_conf = require('../../conf/db-scan-conf');
var hismpc = base.hismpc;

var dbScanTask = function() {
    var rule = new schedule.RecurrenceRule();
    var times = [];
    for(var i=1; i<60; i++){
        times.push(i);
    }
    rule.second = times;
    var c=0;
    var j = schedule.scheduleJob(rule, function(){
        for(var i=0; i< db_scan_conf.dbScanList.length; i++){
            var table = db_scan_conf.dbScanList[i];
            var sql = 'select * from ?? where id > ?';
            var values = [];
            values.push(table.tableName);
            values.push(table.nowId);
            hismpc.query(sql, values, function(err, res, fields){
                //更新完数据库后的操作, 如果失败回滚数据到队列头,
                if(err){
                    //失败了,暂且无操作
                }else{
                    //成功则分发数据
                    log('get results: ' + JSON.stringify(res));
                }
            });
        }
    });
    //一定时间后写文件，可能会分发重复数据
};
module.exports = dbScanTask;