var express = require('express'),
    app = express.createServer(express.logger()),
    io = require('socket.io').listen(app),
    routes = require('./routes');

// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    // app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

// app.configure('development', function () {
//     app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });

// app.configure('production', function () {
//     app.use(express.errorHandler());
// });

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

// Routes

var port = process.env.PORT || 5000; // Use the port that Heroku provides or default to 5000
app.listen(port, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// app.get('/', routes.index);
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket) {
    let handshake = socket.handshake;
    var str = handshake.headers.host + handshake.address + " on " + handshake.time;

    // disconenct
    socket.on('disconnect', function () {
        var farewell = ['feeling inspired.', "still thinking about the last piece he saw."]
        io.emit('disconnect', `${handshake.headers.host} left the show, ${pickRand(farewell)}`)
        subUser();
    });

    // connect
    socket.on('join', function (msg) {
        console.log(msg)
        io.emit('join', msg[0] + str + msg[1]);
    });

    //calculate user
    addUser();
    socket.emit('count', { connections: totalVisitor });
});

// some methods:
function addUser() {
    totalVisitor++;
}

function subUser() {
    totalVisitor--;
}

function pickRand(li) {
    var picked = li[Math.floor(Math.random() * li.length)]
    return picked
}