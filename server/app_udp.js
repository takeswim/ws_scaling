var dgram  	= require('dgram');

var ws      = require('ws').Server;
var wss     = new ws({port:8080});

// pubsub
var client = dgram.createSocket("udp4");
var server = dgram.createSocket("udp4");

var clients = [];
server.on("message", function (message, rinfo) {
    var tag = "" + rinfo.address + ":" + rinfo.port;
    clients[tag] = {addr:rinfo.address,port:rinfo.port};
    // broadcast server
    for (var key in clients) {
        if (key !== tag) {
            client.send(message, 0, message.length, clients[key].port, clients[key].addr);
        }
    }
    console.log(message);
    wss.broadcast(message);
});

server.bind(7777);


// websock
// connection
wss.on('connection', function(socket) {
    console.log("client connected:");
    //console.log(socket);
    // recieve message
    socket.on('message', function(message) {
        client.send(message, 0, message.length, 7777, "instance-1");
    });
    // disconnect
    socket.on('disconnect', function() {
        console.log("client disconnected:");
        //console.log(socket);
    });
});

wss.broadcast = function(data) {
    var data_j = JSON.stringify(data);
    wss.clients.forEach(function(client) {
        client.send(data_j);
    });
};

// EOF
