/**
 * Created by cailong on 2015/7/30.
 */
/*global require*/
'use strict';
var base = require("../base"),
	log = base.log,
	hisredis = base.hisredis,
	client = hisredis.getRedisClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /`* ... */ });

/*var done = client.brpop(['list_test_mocha', 0], function(replay){
	log.info(replay);
});*/

function waitForPush () {
	client.brpop(['list_test_mocha', 0], function (listName, item) {
		// do stuff
		log.info(listName);
		log.info(item);
		waitForPush();
	});
}

waitForPush();
