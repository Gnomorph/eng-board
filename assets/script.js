const width  = 2*(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
const height = 2*(window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight);


console.log(width, height);

var board = document.getElementById("whiteboard");
var ctx = board.getContext("2d");
init(ctx);


board.addEventListener('pointermove', pointHere);
board.addEventListener('pointerdown', startPoint);
board.addEventListener('pointerup', stopPoint);

let last = [0, 0];
let penId;

function isInputType(type, buttons) {
    return (type == "pen" && buttons == "0")||( type == "mouse" && buttons == "1");
}

function pointHere(e) {
    if (e.pointerType == "mouse" && e.buttons != "1") {
        last = [2*e.clientX, 2*e.clientY];
    }

    if (e.pointerType == "pen") {
        penId = e.pointerId;
        last = [2*e.clientX, 2*e.clientY];
    } else if ((penId == e.pointerId && e.pointerType == "touch") || (e.pointerType == "mouse" && e.buttons == "1")) {

        let current = [2*e.clientX, 2*e.clientY];
        let width = 3;

        drawPoint(ctx, ...current, width);
        drawLine(ctx, last || current, current, width);

        last = current
    }
}

function startPoint(e) {
    //console.log(e);
    if (isInputType(e.pointerType)) {
        last = [2*e.clientX, 2*e.clientY];
    }
}

function stopPoint(e) {
    //console.log(e);
    last = null;
    if (isInputType(e.pointerType)) {
        last = null;
    }
}

async function drawPoint(context, x, y, width) {
        context.beginPath();
        context.lineWidth = 0;
        context.arc(x, y, width/2, 0, 2 * Math.PI, false);
        context.fillStyle = "rgb(0, 0, 0)";
        context.fill();
        context.closePath();
}

async function drawLine(context, from, to, width) {
        context.beginPath();
        context.lineWidth = width;
        context.moveTo(...from);
        context.lineTo(...to);
        context.stroke();
        context.closePath();
}

function init(context) {
    context.canvas.width = width;
    context.canvas.height = height;
}

//board.addEventListener('pointermove', testMove);
//board.addEventListener('pointerdown', testDown);
//board.addEventListener('pointerup', testUp);

function testMove(e) {
    let type = document.getElementById(e.pointerType);

    type.querySelector('#x').innerHTML = 2*e.clientX;
    type.querySelector('#y').innerHTML = 2*e.clientY;
    type.querySelector('#buttons').innerHTML = e.buttons;
    type.querySelector('#pressure').innerHTML = e.pressure;
    type.querySelector('#id').innerHTML = e.pointerId;
}

function testUp(e) {
    let type = document.getElementById(e.pointerType);

    type.querySelector('#state').innerHTML = "up";
}

function testDown(e) {
    let type = document.getElementById(e.pointerType);

    type.querySelector('#state').innerHTML = "dn";
}

