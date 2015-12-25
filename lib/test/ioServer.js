/**
 * Created by cl on 2015/12/14.
 */

var sioRedis = require('socket.io-redis');

var ioa = require('socket.io')(6000);
ioa.adapter(sioRedis({host: '192.168.243.128', port: 6379}));


var io = ioa.of('/ns1');
ioa.on('connect', function(socket){
    socket.emit('what', {will: 'default ns'});
});
io.on('what', function(data){
    console.log('server responsed-->'+JSON.stringify(data));
});
io.on('connect', function(socket, data){
    console.log('server response');
    io.sockets;
    //io.emit('what', {will2: 'will2'});
    io.emit('what', { will: 'be received by everyone'});

    socket.on('private message', function (from, msg) {
        console.log('I received a private message by ', from, ' saying ', msg);
    });
    //client emit then server handle it and return
    socket.on('ferret', function(num, cb){
        cb(num + 1);
    });

    socket.on('disconnect', function (data) {
        console.log('disconnect!!!');
    });
});

io.on('user disconnected', function(data){
    console.log('client disconnected--'+data);
});