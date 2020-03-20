var socket = io();
var player;
var players = [];
var context;
var canvas;
var click = false;

// player joins game and sets name
function joinGame() {
    $('.darken').fadeIn(300);
    $('.player').fadeIn(300);
    $('.player').submit(function () {
        event.preventDefault();
        player = $('#username').val().trim();
        if (player === '')
            return false;

        var index = players.indexOf(player);
        if (index !== -1) {
            alert(player + ' already exists');
            return false
        }
        socket.emit('join', player);
        $('.darken').fadeOut(300);
        $('.player').fadeOut(300);
    });
}

// define a pleb player
var plebs = function () {
    clearScreen();
    click = false;
    $('.draw').hide();
    $('#playerTurn').empty();
    $('#guess').show();
    $('#guess').on('submit', function () {
        event.preventDefault();
        var playerTurn = $('.guess-input').val();
        if (playerTurn === '')
            return false;
        socket.emit('playerTurn', {username: player, playerTurn: playerTurn});
        $('.guess-input').val('');
    });
};

// get player's answer and verify if correct answer and sets new king
var playerTurn = function (data) {
    $('#playerTurn').text(data.username + "'s guess: " + data.playerTurn);
    if (click === true && data.playerTurn === $('span.word').text()) {
        socket.emit('correctAnswer', {username: data.username, playerTurn: data.playerTurn});
        socket.emit('swapRole', {from: player, to: data.username});
        click = false;
    }
};

// clear canvas
var clearScreen = function () {
    context.clearRect(0, 0, canvas[0].width, canvas[0].height);
};

// get game's word
var WorkYourMagic = function (word) {
    $('span.word').text(word);
};

// player list on the right of the page
var playerList = function (playerNames) {
    players = playerNames;
    var html = '<h1 class="chatbox-header">' + 'Players' + '</h1>';
    for (var i = 0; i < playerNames.length; i++) {
        html += '<li>' + playerNames[i] + '</li>';
    }
    $('ul').html(html);
};

// new king case
var newKing = function () {
    socket.emit('newKing', player);
    clearScreen();
    $('#playerTurn').empty();
};

// correct answer case
var correctAnswer = function (data) {
    $('#playerTurn').html('<p>' + data.username + ' guessed correctly!' + '</p>');
};

// reset game after finish
var reset = function (name) {
    clearScreen();
    $('#playerTurn').empty();
    $('#playerTurn').html('<p>' + name + ' is the new King' + '</p>');
};

var mouse = {x: 0, y: 0};
var last_mouse = {x: 0, y: 0};

// draw
var draw = function (obj) {
    context.fillStyle = obj.color;
    context.beginPath();
    context.arc(obj.position.x, obj.position.y,
        1, 0, 2 * Math.PI);
    context.fill();
    context.moveTo(last_mouse.x, last_mouse.y);
    context.lineTo(mouse.x, mouse.y);
    context.strokeStyle = obj.color;
    context.lineWidth = 3;
    context.stroke();
    context.closePath();
};

// king's drawing
var king = function () {
    clearScreen();
    click = true;
    $('#guess').hide();
    $('#playerTurn').empty();
    $('.draw').show();
    var drawing;
    var obj = {};
    $('.colors').on('click', 'button', function () {
        obj.color = $(this).attr('value');
        if (obj.color === '0') {
            socket.emit('clearScreen', player);
            context.fillStyle = 'white';
        }
    });
    canvas.on('mousedown', function (event) {
        drawing = true;
    });
    canvas.on('mouseup', function (event) {
        drawing = false;
    });
    canvas.on('mousemove', function (event) {
        var offset = canvas.offset();
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        mouse.x = event.pageX - offset.left;
        mouse.y = event.pageY - offset.top;

        obj.last_position = {
            x: mouse.x,
            y: mouse.y,
        };

        obj.position = {
            x: event.pageX - offset.left,
            y: event.pageY - offset.top,
        };

        if (drawing === true && click === true) {
            draw(obj);
            socket.emit('draw', obj);
            console.log(obj);

        }
    });
};

// main execution order
$(document).ready(function () {
    canvas = $('#canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    joinGame();
    socket.on('playerList', playerList);
    socket.on('plebs', plebs);
    socket.on('playerTurn', playerTurn);
    socket.on('draw', draw);
    socket.on('work your magic', WorkYourMagic);
    socket.on('king', king);
    socket.on('newKing', newKing);
    socket.on('correctAnswer', correctAnswer);
    socket.on('reset', reset);
    socket.on('clearScreen', clearScreen);
});