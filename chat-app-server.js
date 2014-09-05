"use strict";

var WebSocket = require('websocket');
var http = require('http');

var connectedClients = [];


// Utility Function for broadcasting messages to connected clients.
var broadcastMessage = function (message) {
    var payload = JSON.stringify({message: message});
    for (var i = 0; i < connectedClients.length; ++i) {
        connectedClients[i].sendUTF(payload);
    }
};

// Set up our HTTP Server
var httpServer = http.createServer(function (request, response) {

});

httpServer.listen(8001, function () {});


// Set up our Web Socket Server, which uses our HTTP server.
var webSocketServer = new WebSocket.server({
    httpServer: httpServer
});

// Set up our request handlers.
webSocketServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);

    var clientIndex = connectedClients.push(connection) - 1;
    var clientName = "user" + clientIndex;

    console.log('Connection from ' + request.origin + ', username: ' + clientName);

    broadcastMessage({
        message: clientName + ' has connected.',
        sender: 'Server'
    });

    connection.on('message', function (message) {
        console.log('Messaged received from ' + clientName + '.');

        if (message.type === 'utf8') {
            var newMessage = {
                message: message.utf8Data,
                sender: clientName
            };

            // Broadcast to connected clients.
            broadcastMessage(newMessage);
        }
    });

    connection.on('close', function (connection) {
        connectedClients.splice(clientIndex);

        console.log(clientName + ' has disconnected.');

        // Send message indicating client disconnected.
        broadcastMessage({
            message: clientName + ' has disconnected.',
            sender: 'Server'
        });
    });
});