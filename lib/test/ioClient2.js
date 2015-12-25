/**
 * Created by cl on 2015/12/14.
 */
var socket = require('socket.io-client')('http://localhost:6000/ns1', {data: 2});
socket.on('what', function(data){
    console.log('data from server: '+ JSON.stringify(data));
});
socket.on('connect', function(){
    console.log('socket is --> '+ socket);
});
