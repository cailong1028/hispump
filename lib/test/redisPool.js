/**
 * Created by cailong on 2015/8/20.
 */
/*global require*/
'use strict';
var util = require('util');
var log = require('../base').log;
var RedisPool = require('sol-redis-pool');

var LOG_MESSAGE = "Available: %s, Pool Size: %s";

var redisSettings = {
	// Use TCP connections for Redis clients.
	host: "192.168.62.130",
	port: 6379,
	// Set a redis client option.
	enable_offline_queue: true,
	no_ready_check: true
}

var poolSettings = {
	// Set the max milliseconds a resource can go unused before it should be destroyed.
	idleTimeoutMillis: 5000,
	max: 5
	// Setting min > 0 will prevent this application from ending.
};

// Create the pool.
var pool = RedisPool(redisSettings, poolSettings);

// Get connection errors for logging...
pool.on("error", function(reason) {
	log.info("Connection Error:", reason);
});

pool.on("destroy", function(){
	log.info(util.format(" Checking pool info after client destroyed: " + LOG_MESSAGE, pool.availableObjectsCount(), pool.getPoolSize()));
});

pool.acquire(clientConnection);
function clientConnection(err, client) {
	log.info('ABC__.'+err);
	// Issue the PING command.
	client.ping(getPingResponse);
	client.lpush('test', '123123', function(){
		log.info('aaaaaaaaaaa');
	});

	function getPingResponse(err, response) {
		log.info("getPingResponse", err, response);
		setTimeout(delayResponse, 2500);
	}
	function delayResponse() {
		// Release the client after 2500ms.
		pool.release(client);
	}
}

// Setup up a poller to see how many objects are in the pool. Close out when done.
var poller = setInterval(pollRedisPool, 500)

function pollRedisPool() {
	log.info(util.format(LOG_MESSAGE, pool.availableObjectsCount(), pool.getPoolSize()));
	if (pool.availableObjectsCount() == 0 && pool.getPoolSize() == 0) {
		clearInterval(poller);
		log.info('There are no more requests in this pool, the program should exit now...');
	}
}