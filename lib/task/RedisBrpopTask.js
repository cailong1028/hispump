/**
 * Created by cailong on 2015/8/19.
 */
/*global require*/
'use strict';

var _ = require('underscore');
var _s = require('underscore.string');
var $def = require('jquery-deferred');

var base = require('../base/index');
var log = base.log;
var hisrp = base.hisrp;
var hismpc = base.hismpc;
var redis_conf = require('../../conf/redis-conf');
var upload_queues_prefix = redis_conf['upload-queues-prefix'];
var upload_hispump_queue = redis_conf['upload-hispump-queue'];
var upload_his_queues = redis_conf['upload-his-queues'];

var uploadToMysqlQueue = upload_queues_prefix + upload_hispump_queue;

var defaultDelayTime = 1000;
var detectDieTimeout = 5000 * 6;
var brpopTimeout = 5; //second

var RedisBrpopTaskProto = {
	init: function(){
		this.name = 'RedisBrpopTask';
		this.detectDieByTimeout = true;
		this.detectDieTimeout = detectDieTimeout;
		this.lastestExecuteTime = new Date().getTime();
	},
	whenRun: function () {
		var dtd = new $def.Deferred();
		_.delay(function(){
			dtd.resolve();
		}, defaultDelayTime);
		this.taskContent();
		return dtd.promise();
	},
	pushToHiss: function (queue, data) {
		var dtd = new $def.Deferred();
		hisrp.lpush(queue, data, function (err, listName, item2) {
			//TODO 暂时没有对回查回队列头失败的操作), 需要指定方案,牵连到了数据的回滚或者数据回滚的替代方案
			//无论成功失败 都需要执行resolve
			dtd.resolve();
		});
		return dtd.promise();
	},
	taskContent: function(){
		this.lastestExecuteTime = new Date().getTime();
		var currTask = this;
		hisrp.brpop(uploadToMysqlQueue, brpopTimeout, function (err, listName, item) {
			if (err) {
				log.info('ERROR: task {redisBrpopTask} [brpop] : ' + err);
				return currTask.run();
			}
			if (!item) {
				return currTask.run();
			}
			var upload;
			try {
				upload = JSON.parse(item[1]);
			} catch (e) {
				log.info('ERROR: {JSON} [parse] : ' + e);
				return currTask.run();
			}

			if (!upload.dataType) {
				log.info('invalid upload data, poped without update DB');
				return currTask.run();
			}
			var sql = 'update ?? set ? where id = ?';
			var values = [];
			//判断具体操作
			switch (_s.trim(upload.OperateType.toLowerCase())) {
				case 'insert' :
					sql = 'insert into ?? SET ?';
					values.push(upload.dataType);
					values.push(upload.RivamedappData);
					break;
				case 'update' :
					sql = 'update ?? set ? where id = ?';
					values.push(upload.dataType);
					values.push(upload.RivamedappData);
					values.push(upload.RivamedappData.ID);
					break;
				default :
					values.push(upload.dataType);
					values.push(upload.RivamedappData);
					values.push(upload.RivamedappData.ID);
			}

			var mysqlDone = function (err, res, fields) {
				//更新完数据库后的操作, 如果失败回滚数据到队列头,
				if (err) {
					//失败了,并且再将数据添加会队列头之后, 依然继续
					hisrp.lpush(uploadToMysqlQueue, item[1], function (err, listName, item2) {
						//TODO 暂时没有对回查回队列头失败的操作), 需要指定方案,牵连到了数据的回滚或者数据回滚的替代方案
					});
					return currTask.run();
					//def方式实现, 但是此处已有一个异步处理没有必要
					/*pushToHiss(uploadToMysqlQueue, item[1]).done(function(err, listName, item2){
					 currTask.run();
					 });*/
				}
				//成功则插入to his 的队列
				var defs = [];
				_.each(upload_his_queues, function (oneQueue) {
					if (upload[oneQueue]) {
						defs.push(currTask.pushToHiss(upload_queues_prefix + oneQueue, item[1]));
					}
				});
				$def.when.apply($def, defs).done(function () {
					currTask.run();
				}).fail(function () {
					currTask.run();
				});
			};

			//入库操作, 只有一条数据
			hismpc.query(sql, values, mysqlDone);
		});
	}
};


var RedisBrpopTask = base.extend(RedisBrpopTaskProto, base.Task);

module.exports = RedisBrpopTask;