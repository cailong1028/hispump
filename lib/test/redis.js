/**
 * Created by cailong on 2015/7/30.
 */
var base = require("../base"),
	hisredis = base.hisredis,
	client = hisredis.getRedisClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

var done = client.brpop(['list1', 0], function(replay){
	console.log(replay);
});

console.log(done);