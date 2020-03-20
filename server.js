var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var wordList = ["family", "cat", "dog", "Batman",
    "woman", "bike", "flower", "croissant",
    "fish", "smile", "feather", "cake"];

/**
 * @return {string}
 */
// returns random word for game
function RandomWord() {
    let wordIndex = Math.floor(Math.random() * (wordList.length));
    return wordList[wordIndex];
}

var playerList = [];

io.on('connection', function (socket) {
    io.emit('playerList', playerList);

    // player joins game
    socket.on('join', function (player) {
        socket.username = player;
        socket.join(player);
        playerList.push(player);

        // if player is first user or if king room has no user then create new king
        if (playerList.length === 1 || typeof io.sockets.adapter.rooms['king'] === 'undefined') {
            socket.join('king');
            io.in(player).emit('king', player);
            io.in(player).emit('work your magic', RandomWord());

            // else if king exists, everyone is pleb
        } else {
            socket.join('plebs');
            io.in(player).emit('plebs', player);
        }
        // update playerList
        io.emit('playerList', playerList);
    });

    // player leaves game
    socket.on('disconnect', function () {
        for (var i = 0; i < playerList.length; i++) {
            if (playerList[i] === socket.username) {
                playerList.splice(i, 1);
            }
        }
        io.emit('playerList', playerList);

        // if disconnected player is king, reassign new king
        if (typeof io.sockets.adapter.rooms['king'] === "undefined") {
            var newKing = Math.floor(Math.random() * (playerList.length));
            io.in(playerList[newKing]).emit('newKing', playerList[newKing]);
        }
    });

    // reassign new king
    socket.on('newKing', function (player) {
        socket.leave('plebs');
        socket.join('king');
        socket.emit('king', player);
        io.in('king').emit('work your magic', RandomWord());
    });

    // king can swap role to pleb by double clicking on the pleb's name ( who will become new king )
    socket.on('swapRole', function (data) {
        socket.leave('king');
        socket.join('plebs');
        socket.emit('plebs', socket.username);
        io.in(data.to).emit('king', data.to);
        io.in(data.to).emit('work your magic', RandomWord());
        io.emit('reset', data.to);
    });

    // draw
    socket.on('draw', function (element) {
        socket.broadcast.emit('draw', element);
    });

    // player's guess
    socket.on('playerTurn', function (data) {
        io.emit('playerTurn', {username: data.username, playerTurn: data.playerTurn});
    });

    // correct answer
    socket.on('correctAnswer', function (data) {
        io.emit('correctAnswer', data);
    });

    // clear screen
    socket.on('clearScreen', function (player) {
        io.emit('clearScreen', player);
    });
});

server.listen(process.env.PORT || 8080, function () {
    console.log('Please navigate to http://localhost:8080');
});