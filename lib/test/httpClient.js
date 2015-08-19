/**
 * Created by cailong on 2015/8/19.
 */
'use strict';
var base = require('../base');
var HttpClient = base.HttpClient;
var log = base.log;

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
		log('haha-->' + data);
	}
);
new HttpClient({
		host: '127.0.0.1',
		port: 3000,
		path: '/upload',
		method: 'POST',
		encode: 'UTF-8',
		contentType: 'application/json',
		body: {
			dataType: 'CycleDrugSheetDetail',
			depID: '005',
			devID: '38-B1-DB-32-42-2D',
			dataTime: '2014-10-11 9:43:38',
			version: '1.0',
			appData: {
				ID: 1,
				FormID: "aaa",
				DrugID: "bbb",
				IsCycle: "c",
				CycleDate: "ddd",
				CartCode: "e",
				ISSYNC: 2,
				SYNCSN: 2
			}
		}
	},
	function (data) {
		log('haha-->' + data);
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
		console.log('-----resBody-----',resultObject);
	});

	req.on('error', function(e) {
		// TODO: handle error.
		console.log('-----error-------',e);
	});
});
req.write(bodyString);
req.end();*/
