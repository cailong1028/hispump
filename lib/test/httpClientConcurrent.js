/**
 * Created by cailong on 2015/8/20.
 */
/*global require*/
'use strict';
var base = require('../base');
var HttpClient = base.HttpClient;
var log = base.log;

var concurrent = function(times){
	var i;
	var begin = new Date();

	for(i = 0; i < times; i++){
		(function(i){
			setTimeout(function(){
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
							OperateType: 'Update',
							toSys: 'Rivamed',
							RivamedappData: {
								ID: 1,
								FormID: "fff",
								DrugID: "bbb",
								IsCycle: "c",
								CycleDate: "ddd",
								CartCode: "e",
								ISSYNC: 2,
								SYNCSN: 2
							},
							HISappData: {
								ID: 1,
								FormID: "eee",
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
						var now = new Date();
						log((now-begin)+'-->counts-->' + i);
					}
				);
			}, 0);
		})(i);
	}
};

concurrent(100);