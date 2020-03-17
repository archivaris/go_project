

var context;
var canvas;
var click = false;

var clearScreen = function() {
    context.clearRect(0, 0, canvas[0].width, canvas[0].height);
};

var reset = function(name) {
    clearScreen();
    $('#guesses').empty();
    console.log('New drawer: ' + name);
    $('#guesses').html('<p>' + name + ' is the new drawer' + '</p>');
};

var draw = function(obj) {
    context.fillStyle = obj.color;
    context.beginPath();
    context.arc(obj.position.x, obj.position.y,
        3, 0, 2 * Math.PI);
    context.fill();
};



    canvas.on('mousedown', function(event) {
        drawing = true;
    });
    canvas.on('mouseup', function(event) {
        drawing = false;
    });

    canvas.on('mousemove', function(event) {
        var offset = canvas.offset();
        obj.position = {x: event.pageX - offset.left,
            y: event.pageY - offset.top};

        if (drawing == true && click == true) {
            draw(obj);
        };
    });


$(document).ready(function() {

    canvas = $('#canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
});