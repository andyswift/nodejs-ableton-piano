/**
 * Module dependencies.
 */
var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , io = require('socket.io');

var app = module.exports = express(),
    server = http.createServer(app),
    io = io.listen(server);

// Configuration
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/keyboard', routes.keyboard);
app.get('/drums', routes.drums);

// MIDI
var midi = require('midi'),
    midiOut = new midi.output(),
    midiIn = new midi.input();

//midiIn.ignoreTypes(false, false, false);
console.log("Creating Iterate MIDI port");
midiOut.openVirtualPort('Iterate Music');
midiIn.openVirtualPort('Iterate Music');

midiIn.on('message', function (deltaTime, message) {
    console.log('-->:' + message + ' d:' + deltaTime);
});



function attempt1() {

    io.sockets.on('connection', function (socket) {

        // note
        socket.on('notedown', function (data) {
            midiOut.sendMessage([143 + data.channel, data.message, 100]);
            socket.broadcast.emit('playeddown', {'message': data.message});
        });

        // note stop
        socket.on('noteup', function (data) {
            midiOut.sendMessage([127 + data.channel, data.message, 100]);
            socket.broadcast.emit('playedup', {'message': data.message});
        });

    });
}

function attempt2() {

    io.sockets.on('connection', function (socket) {

        // note
        socket.on('notedown', function (data) {
            midiOut.sendMessage([143 + data.channel, 0, data.message +1]);
            socket.broadcast.emit('playeddown', {'message': data.message});
        });

        // note stop
        socket.on('noteup', function (data) {
            midiOut.sendMessage([127 + data.channel, 0, data.message +1]);
            socket.broadcast.emit('playedup', {'message': data.message});
        });

        // controller
        socket.on('controller', function (data) {
            var message = parseInt(data.message, 10);
            console.log("sending: " + data.message )
            midiOut.sendMessage([message, 0, 0]);

            data.channel = 1;
            midiOut.sendMessage([143 + data.channel, 0, 1]);
            midiOut.sendMessage([127 + data.channel, 0, 1]);

            midiOut.sendMessage([143 + data.channel, 0, 2]);
            midiOut.sendMessage([127 + data.channel, 0, 2]);

            midiOut.sendMessage([143 + data.channel, 0, 3]);
            midiOut.sendMessage([127 + data.channel, 0, 3]);

            midiOut.sendMessage([143 + data.channel, 0, 4]);
            midiOut.sendMessage([127 + data.channel, 0, 4]);

            midiOut.sendMessage([143 + data.channel, 0, 5]);
            midiOut.sendMessage([127 + data.channel, 0, 5]);
        });

    });

}


// Stop
process.on("SIGTERM", function () {
    midiOut.closePort();
    midiIn.closePort();
});

// Start
attempt2()
server.listen(3000);
