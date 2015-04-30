var ws         = require('ws').Server;
var redis      = require('redis');
var server     = require('http').createServer();

var wss        = new ws({port:8080});

// redis pubsub
var subscriber = redis.createClient(6379, 'instance-1');
var publisher  = redis.createClient(6379, 'instance-1');
subscriber.on("error", function(err) {
    console.log(err);
});
publisher.on("error", function(err) {
    console.log(err);
});
subscriber.subscribe("chat");
subscriber.on("message", function(channel, message) {
    console.log(message);
    wss.broadcast(message);
});

// websock
// connection
wss.on('connection', function(socket) {
    console.log("client connected:");
    console.log(socket);
    // recieve message
    socket.on('message', function(message) {
        publisher.publish("chat", message);
    });
    // disconnect
    socket.on('disconnect', function() {
        console.log("client disconnected:");
        console.log(socket);
    });
});

wss.broadcast = function(data) {
    var data_j = JSON.stringify(data);
    wss.clients.forEach(function(client) {
        client.send(data);
    });
};

// EOF
