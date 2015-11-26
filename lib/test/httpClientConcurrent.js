/**
 * Created by cailong on 2015/8/20.
 */
/*global require*/
'use strict';
var base = require('../base');
var log = base.log;
var HttpClient = base.HttpClient;

var concurrent = function(times){
	var i;
	var begin = new Date();

	for(i = 0; i < times; i++){
		(function(i){
			setTimeout(function(){
				new HttpClient({
						host: '127.0.0.1',
						port: 5000,
						path: '/upload',
						method: 'POST',
						encode: 'UTF-8',
						contentType: 'application/json',
						body: {
							"OperateType": "insert",
							"dataType": "fw_in_med_orders",
							//"depID": "BQ73",
							"devID": "44-6D-57-E1-3A-35",
							"dataTime": "2015-11-26 11:27:45",
							"version": "1.0",
							"toSys": "Rivamed",
							"RivamedappData": {
								"ID": "3E940589-5834-4CEE-9687-9E545B7995ED"+i,
								"PATIENT_ID": "859958",
								"WARD_SN": "BQ69",
								"WARD_NAME": "",
								"ORDER_NO": "2015-11-26 11:27:44",
								"ORDER_SUB_NO": "",
								"CHARGE_CODE": "4555",
								"ORDER_NAME": "0.9%氯化钠注射液(塑瓶)(0.9%氯化钠注射液)",
								"DRUG_SPEC": "50ml",
								"DOSAGE": "50.000",
								"DOSAGE_UNIT": "ml",
								"FREQUENCY": "QD",
								"ROUTE": "取用",
								"START_TIME": "20151120024730",
								"END_TIME": "20151121024730",
								"ADMIN_TIME": "20151120024730",
								"INSTRUCTION": "ST",
								"ORDER_DOCTOR": "1128",
								"DOCTOR_NAME": "1128",
								"CHARGE_AMOUNT": "1.000",
								"CHARGE_UNIT": "瓶",
								"PHARMACY_ID": "",
								"PHARMACY_NAME": "",
								"DETAIL_SN": "CF24645678",
								"COMMENT": "",
								"GUID": "74B6338E-C73B-49DD-9261-6E89C4415DB7",
								"FLAG": "0",
								//"DEPCODE": "BQ73",
								"SMARTCODE": "44-6D-57-E1-3A-35",
								"ISSYNC": "0"
							}
						}
					},
					function (data) {
						var now = new Date();
						log.info((now-begin)+'-->counts-->' + i);
					}
				);
			}, 0);
		})(i);
	}
};

concurrent(1);
