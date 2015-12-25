/**
 * Created by cl on 2015/12/14.
 */
var socket = require('socket.io-client')('http://localhost:6000');
socket.on('what', function(data){
    console.log('data from server: '+ JSON.stringify(data));
    socket.emit('ferret', 1, function(data){
        console.log('data +1 by server is --> '+ data);
    });
});
