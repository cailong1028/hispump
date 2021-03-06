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

//var downloadedYetPrefix = redis_conf['downloaded-yet-prefix'];
//var queryingTriggerData = redis_conf['querying-trigger-data'];
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
//当在trigger_data表中查询到一条记录, 向redis中标记词条数据已经正在被当前集群中某台机器操作的标记, 此事件表示在此时间之后
//此标记将自动销毁, 防止redis数据无限制的增大
var flagExpireTime = 60;

var taskContent = function () {
	// query download table
	// each query data, and download queue
	// each push to download pool, each trans delete download table each data
	// when error return revoke downloadTask, and when success also to
	var currTask = this;

	var resolveRowdata = function (oneRow) {
		//更新任务最近一次活动时间
		currTask.lastestExecuteTime =  new Date().getTime();
		//query bound data by tableName and id
		var dtd = new $def.Deferred();
		var tableName = oneRow[triggerDataTableName_table_column];
		var id = oneRow['DATAID'];
		var type = oneRow[triggerDataTableName_type_column];
		var sql = 'select * from ?? where id = ?';
		hismpc.query(sql, [tableName, id], function (err, res, fields) {
			//再次检测此数据是否已经被其他并行node server处理过(mysql的操作时间长于redis), 此时如果以处理过此数据, 必然查到记录
			/*hisrp.get(oneRow.ID).done(function(replay){
			 if(!replay){
			 hisrp.set(downloadedYetPrefix + oneRow.ID, true);
			 //一分钟之内
			 hisrp.expire(oneRow.ID, flagExpireTime);

			 $def.when(resolveRowdata(oneRow)).done(handleOneRowDone).fail(handleOneRowFail);
			 }else{
			 //已被负载或者集群中的其他机器操作过了, 不再处理了
			 return dtd.resolve();
			 }

			 }).fail(function(err){
			 return dtd.reject(err);
			 });*/

			if (err) {
				log.error('ERROR: there is no row data in table [' + tableName + '], where id = [' + id + ']');
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
				//修改downloadData 的 ISSYNC = 2, 表示是服务端下行的数据，客户端判断ISSYNC===2时，不再发送上行请求
				//160310贾子良提出需求，fw_in_med_orders表GUID不操作，他们那边自动填充此字段
				if(tableName.toLowerCase() === 'fw_in_med_orders'){
					downloadData = _.omit(downloadData, 'GUID');
				}
				var downloadDataPackage = {type: type, tableName: tableName, id: downloadData.ID, data: _.extend(downloadData, {ISSYNC: '2'})};
				hisrp.lpush(queueName, JSON.stringify(downloadDataPackage), function (err, listName, item) {
					if (err) {
						log.error('ERROR: lpush to download queue [' + queueName + '] failed: ' + err);
						return dtd.reject(err);
					}
					dtd.resolve();
				});
			};

			//下发所有设备
			var handleDataFromHisOrHispumpToAllDev = function(){
				var devSql = 'select * from medcart';
				var pushToEachQueue = function (one) {
					var dtd2 = new $def.Deferred();
					pushToDevQueue(download_queues_prefix + one.ID, dtd2);
					return dtd2.promise();
				};
				hismpc.query(devSql, function (err, res, fields) {
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
			};

			//his或者hispump系统下发数据
			var handleDataFromHisOrHispump = function(){
				if(downloadData['DEPCODE']){
					var devSql = 'select * from medcart where dept_code = ?';
					var pushToEachQueue = function (one) {
						var dtd2 = new $def.Deferred();
						pushToDevQueue(download_queues_prefix + one.ID, dtd2);
						return dtd2.promise();
					};
					hismpc.query(devSql, [downloadData['DEPCODE']], function (err, res, fields) {
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
				}else if(downloadData['SMARTCODE']){
					//指定了设备
					if (downloadData.SMARTCODE && downloadData.SMARTCODE !== '') {
						return pushToDevQueue(download_queues_prefix + downloadData.SMARTCODE, dtd);
					}
				}else{//没有指定科室和设备, 认为是无效数据
					dtd.resolve();
				}
			};

			var handleDataFromDev = function(){
				//下发到科室下除自己之外的其他机器
				var devSql = 'select * from medcart where id != ? and dept_code = (select dept_code from medcart where id = ?)';
				var pushToEachQueue = function (one) {
					var dtd2 = new $def.Deferred();
					pushToDevQueue(download_queues_prefix + one.ID, dtd2);
					return dtd2.promise();
				};
				hismpc.query(devSql, [downloadData.SMARTCODE, downloadData.SMARTCODE], function (err, res, fields) {
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
			};

			var handleDataExceptSelf = function(){
				//下发到除自己之外的其他机器
				var devSql = 'select * from medcart where id != ? ';
				var pushToEachQueue = function (one) {
					var dtd2 = new $def.Deferred();
					pushToDevQueue(download_queues_prefix + one.ID, dtd2);
					return dtd2.promise();
				};
				hismpc.query(devSql, [downloadData.SMARTCODE, downloadData.SMARTCODE], function (err, res, fields) {
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
			};

			/*
			 * operator(syncsn字段) === his时
			 * 如果有depcode(指定了科室信息), 下发给科室下所有的设备
			 * 如果没有depcode, 查看smarcode, 指定给单个设备
			 *
			 * operator(syncsn字段) === hispump时 操作同his时
			 *
			 * operator(syncsn字段) 为mac地址时
			 * 判断issync, 如果为true, 下发给同科室下的其他机器, 如果如false, 不操作, 直接删除trigger_data表里此条数据
			 *
			 * 其他时, 无效数据, 直接删除trigger_data表里面的这条数据
			 * */
			//fw_开头的表中除了fw_in_med_orders, 都全部下发tableName
			/*if(downloadData.ISSYNC !== '0'){
				return dtd.resolve();
			}*/
			if(tableName.toLowerCase() === 'fw_apps_druginfo'
				|| tableName.toLowerCase() === 'fw_dept_dict'
				|| tableName.toLowerCase() === 'fw_dept_drug'
				|| tableName.toLowerCase() === 'fw_staff_dict'
				|| tableName.toLowerCase() === 'fw_in_patient_info'){
				if(/(([a-zA-Z0-9]{2}-){5})[a-zA-Z0-9]{2}/.test(downloadData.SYNCSN)){
					//给除自身外的全部设备下发，没有科室的限制
					return handleDataExceptSelf();
				}else{
					return handleDataFromHisOrHispumpToAllDev();
				}
			}
 			if(downloadData.SYNCSN === 'his'){
				handleDataFromHisOrHispump();
			}else if(downloadData.SYNCSN === 'hispump'){
				handleDataFromHisOrHispump();
			}else if(/(([a-zA-Z0-9]{2}-){5})[a-zA-Z0-9]{2}/.test(downloadData.SYNCSN)){//匹配mac
				if(!downloadData.ISSYNC || downloadData.ISSYNC === '0' || downloadData.ISSYNC === '' ){
					handleDataFromDev();
				}else{
					//不同步
					return dtd.resolve();
				}
			}else{//syncsn 没有指定, 认为是无效数据
				//通知trigger删除此条数据
				return dtd.resolve();
			}
		});
		return dtd.promise();
	};

	if(currTask.debug){
		log.info('INFO: task {downloadTask} begin it~s [' + ++this.taskExeuteCount + '] times invoke');
	}

	currTask.lastestExecuteTime = new Date().getTime();

	var sql = 'select * from ?? where ?? < ? order by occurtime asc';
	var queryTriggerDataDone = function (err, res, fields) {
		//删除查询标志
		//
		if (err) {
			log.error('ERROR: {downloadTsk} query mysql error: ' + err);
			if(currTask.status === 'died'){
				log.error('stop loop');
				
				return;
			}
			
			return currTask.run();
		}
		if (!res || res.length === 0) {
			//trigger data 表中没有数据的时候, 直接返回执行自己
			if(currTask.status === 'died'){
				log.error('stop loop');
				
				return;
			}
			
			return currTask.run();
		}
		var defs = [];

		var handleOneRow = function (oneRow) {
			var dtd = new $def.Deferred();

			var updateTriggerDataWhenError = function (err) {
				var updateSql = 'update ?? set ? where ?? = ? and ?? = ? and ?? = ?';
				var cnt = oneRow[triggerDataTableName_errorcount_column]++;
				var values = [triggerDataTableName, {ERROR: err, ERROTCOUNT: cnt},
					'ID', oneRow.ID,
					triggerDataTableName_table_column, oneRow[triggerDataTableName_table_column],
					triggerDataTableName_dataid_column, oneRow.DATAID];
				hismpc.query(updateSql, values, function (errUpdate, res, field) {
					if (errUpdate) {
						log.error('ERROR: update trigger data error: ' + JSON.stringify(errUpdate).substring(0, 499));
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
						log.error('ERROR: DELETE TRIGGER DATA [' + oneRow[triggerDataTableName_table_column] + ', ' + oneRow.DATAID + '] failed');
						return updateTriggerDataWhenError(err);
					}
					dtd.resolve();
				};

				//1: 非事务模式 --begin
				hismpc.query(deleteSql, values, function(err, res, fields){
					deleteDone(err);
					log.info('DELETE TRIGGER DATA [' + oneRow[triggerDataTableName_table_column] + ', ' + oneRow.DATAID + '] SUCCESS');
				});
				//非事务模式 --end

				//2: 事务模式 --begin
				/*var getTransDone = function (trans) {
					trans.query(deleteSql, values, function (err, res, fields) {
						deleteDone(err);
					});
					trans.commit(function () {
						log.info('DELETE TRIGGER DATA [' + oneRow[triggerDataTableName_table_column] + ', ' + oneRow.DATAID + '] SUCCESS');
					});
				};
				var getTransFail = function (err) {
					log.error('ERROR: fail to get mysql transaction when {downloadTask} delete trigger data');
					//记录是按row执行的,各个row之间的数据不影响, 即便上一个row执行失败, 也会continue执行之后的row
					//如果中间某个row dtd使用了reject, 后面的row dtd不会执行
					//即各个def之间不允许dtd.reject
					return dtd.resolve({errMsg: err});
				};
				hismpc.getTrans().done(getTransDone).fail(getTransFail);*/
				//事务模式 --end
			};

			var handleOneRowFail = function (err) {
				//不删除词条记录,但是更新其错误次数和失败原因, 下次downloadTask时,继续对此记录操作
				updateTriggerDataWhenError(err);
			};

			//查询并行集群是否已经对词条数据操作
			//单核启动下行任务， 且保证单核内只有一个下行任务， 无需判断reids
			//多个任务的时候， 重复执行， 且每条数据都执行redis 查询过多， 造成redis连接数量过多， 总体下行时间过长
			/*hisrp.get(downloadedYetPrefix + oneRow.ID).done(function (replay) {
				if (!replay) {
					hisrp.set(downloadedYetPrefix + oneRow.ID, true).done(function () {
						//一分钟之内,
						//Attention please(注意)
						//如果set的同时设置expire, 一定要在set done之后执行expire, 否则可能设置expire的时候, 还查找不到set的数据
						hisrp.expire(downloadedYetPrefix + oneRow.ID, flagExpireTime);
					});

					$def.when(resolveRowdata(oneRow)).done(handleOneRowDone).fail(handleOneRowFail);
				} else {
					//已被负载或者集群中的其他机器操作过了, 不再处理了
					return dtd.resolve();
				}

			}).fail(function (err) {
				return dtd.reject(err);
			});*/

			$def.when(resolveRowdata(oneRow)).done(handleOneRowDone).fail(handleOneRowFail);
			return dtd.promise();
		};
		_.each(res, function (oneRow) {
			defs.push(handleOneRow(oneRow));
		});
		$def.when.apply($def, defs).done(function () {
			//revoke self when all done
			if(currTask.status === 'died'){
				log.error('stop loop -- right');
				
				return;
			}
			
			return currTask.run();
		}).fail(function (err) {
			log.error('ERROR: {downloadTask} deferred ERROR: ' + err);
			log.error('\tBussiness ERROR: if you see here , it meas your CODE is not Correct in Bussiness');
			if(currTask.status === 'died'){
				log.error('stop loop');
				
				return;
			}
			
			return currTask.run();
		});
	};

	//如果其他并行node-server正在trigger_data表是否正在被查询,此次任务不执行
	/*hisrp.get(queryingTriggerData).done(function(res){
		if(!res || res === 'null'){
			hisrp.set(queryingTriggerData, true).done(function(){
				//保险起见, 即便程序出错, 因为数据设置了expire, 会销毁的
				hisrp.expire(queryingTriggerData, 10);
				hismpc.query(sql, [triggerDataTableName, triggerDataTableName_errorcount_column, rowDataCanBeFoundMaxErrorTimes], queryTriggerDataDone, currTask.debug);
			});
		}
	}).fail(function(err){
		log.error('redis {get} ['+queryingTriggerData+']: '+err)
	});*/

	//不再检测queryingTriggerData了， 没有意义， 重复数据的操作由其自身的id在redis中记录的操作记录来标识，
	//而且如果存在queryingTriggerData， 如果设置expire失败的话， 又不走del， 会造成数据不下行的bug
	//所以不对queryingTriggerData做判断了， 151209 cl modify
	hismpc.query(sql, [triggerDataTableName, triggerDataTableName_errorcount_column, rowDataCanBeFoundMaxErrorTimes], queryTriggerDataDone, currTask.debug);
	//
};

var DownloadTask = base.extend({
	init: function () {
		//任务执行次数
		this.taskExeuteCount = 0;
		this.name = 'DownloadTask';
		this.detectDieByTimeout = true;
		this.detectDieTimeout = taskSleepTimeWhenNoTriggerDataOrErrorOccur * 120;
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
	whenStop: function(){
		var dtd = new $def.Deferred();
		var currTask = this;
		_.delay(function(){
			//do something when stop
			dtd.resolve();
		}, 0);
		return dtd.promise();
	},
	taskContent: function (delayTime) {
		_.delay(taskContent.bind(this), delayTime || taskSleepTimeWhenNoTriggerDataOrErrorOccur);
	}
}, base.Task);

module.exports = DownloadTask;
