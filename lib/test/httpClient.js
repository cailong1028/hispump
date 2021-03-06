/**
 * Created by cailong on 2015/8/19.
 */
/*global require*/
'use strict';
var base = require('../base');
//var log = base.log;
var HttpClient = base.HttpClient;

new HttpClient({
		host: '127.0.0.1',
		port: 3000,
		path: '/test/lisi',
		method: 'GET',
		encode: 'UTF-8',
		query: {
			name: '张'
		}
	},
	function (data) {
		log.info('haha-->' + data);
	}
);
new HttpClient({
		host: '127.0.0.1',
		port: 5000,
		path: '/upload',
		method: 'POST',
		encode: 'UTF-8',
		contentType: 'application/json',
		body: {
			"OperateType": "insert",
			"dataType": "CycleDrugSheetDetail",
			"depID": "005",
			"devID": "38-B1-DB-32-42-2D",
			"dataTime": "2014-10-11 9:43:38",
			"version": "1.0",
			"toSys": "Rivamed-HIS",
			"RivamedappData": {
				"ID": "1",
				"FormID": "1",
				"DrugID": "1",
				"IsCycle": "1",
				"CycleDate": "1",
				"CartCode": "1",
				"ISSYNC": "1",
				"SYNCSN": "1"
			},
			"HISappData": {
				"ID": "1",
				"FormID": "1",
				"DrugID": "1",
				"IsCycle": "1",
				"CycleDate": "1",
				"CartCode": "1",
				"ISSYNC": "1",
				"SYNCSN": "1"
			}
		}
	},
	function (data) {
		//log.info('haha-->' + data);
	}
);


// get api/user
new HttpClient({
		host: '127.0.0.1',
		port: 5000,
		path: '/api/ping',
		method: 'GET',
		encode: 'UTF-8',
		contentType: 'application/json'
	},
	function (data) {
		log.info('get /api/user/:id-->' + JSON.stringify(data));
	}
);


/*var body = {
 dataType: 'CycleDrugSheetDetail',
 depID: '005',
 devID: '38-B1-DB-32-42-2D',
 dataTime: '2014-10-11 9:43:38',
 version: '1.0',
 appData: {
 ID: "id1",
 FormID: "aaa",
 DrugID: "bbb",
 IsCycle: "ccc",
 CycleDate: "ddd",
 CartCode: "eee",
 ISSYNC: "fff",
 SYNCSN: "ggg"
 }
 };

 var bodyString = JSON.stringify(body);

 var headers = {
 'Content-Type': 'application/json',
 'Content-Length': bodyString.length
 };

 var options = {
 host: '127.0.0.1',
 port: 3000,
 path: '/upload',
 method: 'POST',
 headers: headers
 };

 var req=http.request(options,function(res){
 res.setEncoding('utf-8');

 var responseString = '';

 res.on('data', function(data) {
 responseString += data;
 });

 res.on('end', function() {
 //这里接收的参数是字符串形式,需要格式化成json格式使用
 var resultObject = JSON.parse(responseString);
 console.log.info('-----resBody-----',resultObject);
 });

 req.on('error', function(e) {
 // TODO: handle error.
 console.log.info('-----error-------',e);
 });
 });
 req.write(bodyString);
 req.end();*/
