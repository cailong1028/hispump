/**
 * Created by cailong on 2015/8/28.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
//node中使用jquery的deferred模块, 需要调用[jquery-deferred] module
//jquery deferred, 任意一个dtd.reject之后 都会进入fail, 并且在一个reject之后,后面的dtd不会执行
var $def = require('jquery-deferred');

var base = require('../base');
var log = base.log;
var hismpc = base.hismpc();
var hisrp = base.hisrp();
var redis_conf = require('../../conf/redis-conf');

//download下行队列的前缀
var download_queues_prefix = redis_conf['download-queues-prefix'];

//download监控的表名
var triggerDataTableName = 'TRIGGER_DATA';
var triggerDataTableName_table_column = 'TABLENAME';
var triggerDataTableName_dataid_column = 'DATAID';
var triggerDataTableName_errorcount_column = 'ERRORCOUNT';
var triggerDataTableName_type_column = 'TYPE';

//查询策略: 如果trigger_data表没有数据, delay taskSleepTimeWhenNoTriggerData秒查询
//如果有数据,在此次task执行完毕之后,立马(或者根据设置的delay)继续进行查询
var taskSleepTimeWhenNoTriggerDataOrErrorOccur = 5000;
//只查询小于此处设定的失败次数的数据
var rowDataCanBeFoundMaxErrorTimes = 5;

//任务执行次数
var taskExeuteCount = 0;

//当在trigger_data表中查询到一条记录, 向redis中标记词条数据已经正在被当前集群中某台机器操作的标记, 此事件表示在此时间之后
//此标记将自动销毁, 防止redis数据无限制的增大
var flagExpireTime = 60;
var resolveRowdata = function (oneRow) {
	//query bound data by tableName and id
	var dtd = new $def.Deferred();
	var tableName = oneRow[triggerDataTableName_table_column];
	var id = oneRow['DATAID'];
	var type = oneRow[triggerDataTableName_type_column];
	var sql = 'select * from ?? where id = ?';
	hismpc.query(sql, [tableName, id], function (err, res, fields) {
		//再次检测此数据是否已经被其他并行node server处理过(mysql的操作时间长于redis), 此时如果以处理过此数据, 必然查到记录
		hisrp.get(oneRow.ID).done(function(replay){
			if(!replay){
				hisrp.set(oneRow.ID, true);
				//一分钟之内
				hisrp.expire(oneRow.ID, flagExpireTime);

				$def.when(resolveRowdata(oneRow)).done(handleOneRowDone).fail(handleOneRowFail);
			}else{
				//已被负载或者集群中的其他机器操作过了, 不再处理了
				return dtd.resolve();
			}

		}).fail(function(err){
			return dtd.reject(err);
		});

		if (err) {
			log.info('ERROR: there is no row data in table [' + tableName + '], where id = [' + id + ']');
			//reject, 告知后续不要删除词条记录
			return dtd.reject('ERROR: query this data where id = \'' + id + '\' not in table [' + tableName + '] error');
		}
		//ID对应的只可能有一条数据
		var downloadData = res[0];
		//程序中可能出现的找不到对应表中数据的问题, 属于系统级别的错误, 这种情况下认为此条数据无效,执行resolve,
		//告知后续删除此条trigger记录
		if (!downloadData || downloadData === '') {
			return dtd.resolve('ERROR: the data where id = \'' + id + '\'not found in table [' + tableName + ']');
		}
		var pushToDevQueue = function (queueName, dtd) {
			//下发的数据包中包含
			//1:	type		(0  表示insert, 1	表示update)
			//2:	tableName	(要操作的表)
			//3: 	id			(数据id)
			//4:	data		(此条数据信息)
			var downloadDataPackage = {type: type, tableName: tableName, id: downloadData.ID, data: downloadData};
			hisrp.lpush(queueName, JSON.stringify(downloadDataPackage), function (err, listName, item) {
				if (err) {
					log.info('ERROR: lpush to download queue [' + queueName + '] failed: ' + err);
					return dtd.reject(err);
				}
				dtd.resolve();
			});
		};
		//指定了设备
		if (downloadData.SMARTCODE && downloadData.SMARTCODE !== '') {
			return pushToDevQueue(download_queues_prefix + downloadData.SMARTCODE, dtd);
		}
		var devSql = 'select * from dev where deptid = ?';
		var pushToEachQueue = function (one) {
			var dtd2 = new $def.Deferred();
			pushToDevQueue(download_queues_prefix + one.ID, dtd2);
			return dtd2.promise();
		};
		hismpc.query(devSql, [downloadData['DEPCODE']], function (err, res, fields) {
			//此科室只有此一台设备, 也需要下发数据 因为这条数据的更新可能是his系统下发的
			var defs2 = [];
			_.each(res, function (one) {
				defs2.push(pushToEachQueue(one));
			});
			$def.when.apply($def, defs2).done(function () {
				dtd.resolve();
			}).fail(function (err) {
				//告知后续不要删除,下次执行downloadTask的时候, 继续对此条数据操作
				dtd.reject(err);
			});
		});
	});
	return dtd.promise();
};


var taskContent = function () {
	// query download table
	// each query data, and download queue
	// each push to download pool, each trans delete download table each data
	// when error return revoke downloadTask, and when success also to

	log.info('INFO: task {downloadTask} begin it~s [' + ++taskExeuteCount + '] times invoke');
	var currTask = this;
	currTask.lastestExecuteTime = new Date().getTime();

	var sql = 'select * from ?? where ?? < ? order by occurtime asc';
	var queryTriggerDataDone = function (err, res, fields) {
		if (err) {
			log.info('ERROR: {downloadTsk} query mysql error: ' + err);
			return currTask.taskContent();
		}
		if (!res || res.length === 0) {
			//trigger data 表中没有数据的时候, 直接返回执行自己
			return currTask.taskContent();
		}
		var defs = [];

		var handleOneRow = function (oneRow) {
			var dtd = new $def.Deferred();

			//查询并行集群是否已经对词条数据操作
			hisrp.get(oneRow.ID).done(function(replay){
				if(!replay){
					hisrp.set(oneRow.ID, true);
					//一分钟之内
					hisrp.expire(oneRow.ID, flagExpireTime);

					$def.when(resolveRowdata(oneRow)).done(handleOneRowDone).fail(handleOneRowFail);
				}else{
					//已被负载或者集群中的其他机器操作过了, 不再处理了
					return dtd.resolve();
				}

			}).fail(function(err){
				return dtd.reject(err);
			});

			var updateTriggerDataWhenError = function (err) {
				var updateSql = 'update ?? set ? where ?? = ? and ?? = ? and ?? = ?';
				var cnt = oneRow[triggerDataTableName_errorcount_column]++;
				var values = [triggerDataTableName, {ERROR: err, ERROTCOUNT: cnt},
					'ID', oneRow.ID,
					triggerDataTableName_table_column, oneRow[triggerDataTableName_table_column],
					triggerDataTableName_dataid_column, oneRow.DATAID];
				hismpc.query(updateSql, values, function (errUpdate, res, field) {
					if (errUpdate) {
						log.info('ERROR: update trigger data error: ' + JSON.stringify(errUpdate).substring(0, 499));
					}
					//记录是按row执行的,各个row之间的数据不影响, 即便上一个row执行失败, 也会continue执行之后的row
					//如果中间某个row dtd使用了reject, 后面的row dtd不会执行
					//即各个def之间不允许dtd.reject
					return dtd.resolve({errMsg: err});
				});
			};

			var handleOneRowDone = function () {
				//删除, 此处只有一条记录, 没有必要时候事务, 但此处列出
				//非事务和事务两种操作的代码
				var deleteSql = 'delete from ?? where ?? = ? and ?? = ? and ?? = ?';
				var values = [
					triggerDataTableName,
					'ID', oneRow.ID,
					triggerDataTableName_table_column, oneRow[triggerDataTableName_table_column],
					triggerDataTableName_dataid_column, oneRow.DATAID
				];

				var deleteDone = function (err) {
					if (err) {
						log.info('ERROR: DELETE TRIGGER DATA [' + oneRow[triggerDataTableName_table_column] + ', ' + oneRow.DATAID + '] failed');
						return updateTriggerDataWhenError(err);
					}
					dtd.resolve();
				};

				//1: 非事务模式 --begin
				//hismpc.query(deleteSql, values, function(err, res, fields){
				//	deleteDone(err);
				//});
				//非事务模式 --end

				//2: 事务模式 --begin
				var getTransDone = function (trans) {
					trans.query(deleteSql, values, function (err, res, fields) {
						deleteDone(err);
					});
					trans.commit(function () {
						log.info('DELETE TRIGGER DATA [' + oneRow[triggerDataTableName_table_column] + ', ' + oneRow.DATAID + '] SUCCESS');
					});
				};
				var getTransFail = function (err) {
					log.info('ERROR: fail to get mysql transaction when {downloadTask} delete trigger data');
					//记录是按row执行的,各个row之间的数据不影响, 即便上一个row执行失败, 也会continue执行之后的row
					//如果中间某个row dtd使用了reject, 后面的row dtd不会执行
					//即各个def之间不允许dtd.reject
					return dtd.resolve({errMsg: err});
				};
				hismpc.getTrans().done(getTransDone).fail(getTransFail);
				//事务模式 --end
			};

			var handleOneRowFail = function (err) {
				//不删除词条记录,但是更新其错误次数和失败原因, 下次downloadTask时,继续对此记录操作
				updateTriggerDataWhenError(err);
			};

			return dtd.promise();
		};
		_.each(res, function (oneRow) {
			defs.push(handleOneRow(oneRow));
		});
		$def.when.apply($def, defs).done(function () {
			//revoke self when all done
			return currTask.taskContent();
		}).fail(function (err) {
			log.info('ERROR: {downloadTask} deferred ERROR: ' + err);
			log.info('\tBussiness ERROR: if you see here , it meas your CODE is not Correct in Bussiness');
			return currTask.taskContent();
		});
	};

	hismpc.query(sql, [triggerDataTableName, triggerDataTableName_errorcount_column, rowDataCanBeFoundMaxErrorTimes], queryTriggerDataDone);
};

var DownloadTask = base.extend({
	init: function () {
		this.name = 'DownloadTask';
		this.detectDieByTimeout = true;
		this.detectDieTimeout = taskSleepTimeWhenNoTriggerDataOrErrorOccur * 5;
		this.lastestExecuteTime = new Date().getTime();
	},
	whenRun: function () {
		var dtd = new $def.Deferred();
		var currTask = this;
		_.delay(function(){
			currTask.taskContent();
			dtd.resolve();
		}, 0);
		return dtd.promise();
	},
	taskContent: function (delayTime) {
		_.delay(taskContent.bind(this), delayTime || taskSleepTimeWhenNoTriggerDataOrErrorOccur);
	}
}, base.Task);

module.exports = DownloadTask;
