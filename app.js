/**
 * Copyright 2013 Bruno Coelho Santiago
 * Module dependencies.
 */

var express = require('express');
var app     = express();
var http    = require('http').createServer(app);
var io      = require('socket.io').listen(http);
var path    = require('path');

var routes  = require('./routes');
var user    = require('./routes/user');

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', routes.index);
// app.get('/users', user.list);

http.listen(app.get('port'));

io.sockets.on('connection', function (client) {
    console.log('Client connected...');

    client.on('join', function (nickname) {
        client.set('nickname', nickname);
        console.log(nickname);
        client.broadcast.emit('message', nickname + ' joined the chat.');
    });

    client.on('message', function (message) {
        console.log('Client sent this message:');
        console.log(message);
        client.get('nickname', function (err, name) {
            var msg;
            if (!err) {
                msg = name + ': ' + message;
            }
            else {
                msg = message;
            }
            client.broadcast.emit('message', msg);
            // Sending message to myself.
            client.emit('message', 'me: ' + message);
        });
    });
});
