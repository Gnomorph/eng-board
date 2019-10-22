const resolution = 2;

const width  = resolution*(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
const height = resolution*(window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight);


const penWidth = 1.5*resolution;
//console.log(width, height);

var board = document.getElementById("whiteboard");
var settingsButton = document.getElementById("settings-button");
var ctx = board.getContext("2d");
init(ctx);


board.addEventListener('pointermove', pointHere);
board.addEventListener('pointerdown', startPoint);
board.addEventListener('pointerup', stopPoint);
//board.addEventListener('click', clickPoint);

settingsButton.addEventListener('click', toggleDebug);

class Pointer {
    constructor(id, width, pressureThreashold) {
        this.id = id;
        this.width = width;
        this.pressureThreashold = pressureThreashold;

        this.clearHistory();
    }

    setId(id) {
        if (this.id != id) {
            this.id = id;
            this.clearHistory();
        }
    }

    clearHistory() {
        this.type = "eraser";
        this.history = [null, null, null, null];
    }

    hasTilt(tiltX, tiltY) {
        if (tiltX != 0 || tiltY != 0) {
            this.type = "pen";
            return true;
        } else if (this.type === "pen") {
            return true;
        } else {
            return false;
        }
    }

    async draw(context, x, y, pressure) {
            this.history[3] = [x, y];

            if (pressure > this.pressureThreashold) {
                let pressureWidth = (pressure*(0.5 + pressure) * this.width);
                drawBezier(context, ...this.history, pressureWidth);
            }

            this.history[0] = this.history[1];
            this.history[1] = this.history[2];
            this.history[2] = this.history[3];
    }

    async erase(context, x, y) {
        drawArc(context, x, y, 50*this.width, "#ffffff")
    }

}

let last = [0, 0];
let n0, n1, n2, n3;
let mousePoints = [null, null, null, null];
let penPoints = [null, null, null, null];
let penId;
let pen = new Pointer(null, penWidth, 0.4);
let timerId = null;
let touchEnabled = false;

function pointHere(e) {
    if (e.pointerType=="pen") {
        pen.setId(e.pointerId);
        pen.hasTilt(e.tiltX, e.tiltY);

        if (e.buttons == "1") {
            if (pen.type == "pen") {
                pen.draw(ctx, resolution*e.clientX, resolution*e.clientY, e.pressure);
                /*
            penPoints[3] = [resolution*e.clientX, resolution*e.clientY];

            if (e.pressure > 0.4) {
                let penPressureWidth = (e.pressure*(0.5 + e.pressure) * penWidth);
                drawBezier(ctx, ...penPoints, penPressureWidth);
            }

            penPoints[0] = penPoints[1];
            penPoints[1] = penPoints[2];
            penPoints[2] = penPoints[3];
            */
            } else if (pen.type == "eraser") {
                pen.erase(ctx, resolution*e.clientX, resolution*e.clientY);
            }
        } else {
            pen.clearHistory();
        }
    } else if (e.pointerType=="mouse" && e.buttons == "1") {
        // mouse support
        mousePoints[3] = [resolution*e.clientX, resolution*e.clientY];

        drawBezier(ctx, ...mousePoints, penWidth);

        mousePoints[0] = mousePoints[1];
        mousePoints[1] = mousePoints[2];
        mousePoints[2] = mousePoints[3];
    } else if (penId == e.pointerId && e.pointerType == "touch") {
        // legacy/default pen support
        //drawBezier(ctx, ...n0, ...n1, ...n2, penWidth);
    } else if (e.pointerType=="touch" && touchEnabled && e.buttons=="1") {
        // touch support
        //drawBezier(ctx, ...n0, ...n1, ...n2, penWidth);
    }
}

function drawPage() {
    //let path = JSON.parse(JSON.stringify(stroke));
    let path = stroke;
    //stroke = [path[path.length-1]];
    //drawLines(ctx, path, penWidth);
}

function startPoint(e) {
}

function stopPoint(e) {
    if (e.mozInputSource == 1) {
        mousePoints = [null, null, null, null];
    } else if (e.mozInputSource == 2) {
        penPoints = [null, null, null, null];
    }
}

async function drawPoints(context, x, y, width) {
    context.beginPath();
    context.lineWidth = 0;
    context.arc(x, y, width/2, 0, 2 * Math.PI, false);
    context.fillStyle = "rgb(0, 0, 0)";
    context.fill();
}

/*
async function drawLines(context, path, width) {
    //context.beginPath();
    context.lineWidth = width;
    context.lineCap = "round";

    if (path.length > 0) {
        p0 = path[0];

        for (let p1 of path) {
            if (Math.abs(p0[0] - p1[0]) + Math.abs(p0[1] - p1[1]) < penWidth) {
                drawArc(context, p1, penWidth);
                //context.arc(p1[0], p1[1], width/4, 0, 2 * Math.PI, false);
                //context.fill();
            } else {
                drawLine(context, p0, p1, penWidth);
                context.moveTo(...p0);
                context.lineTo(...p1);
            }
        }
        //context.closePath();
        context.stroke();
    }
}
*/

async function drawArc(context, x, y, width, style) {
    context.beginPath();
    context.lineWidth = 0;
    context.arc(x, y, width/2, 0, 2 * Math.PI, false);
    context.fillStyle = style || "rgb(0, 0, 0)";
    context.fill();
    context.closePath();
}

async function drawPoint(context, x, y, width) {
    context.beginPath();
    context.lineWidth = 0;
    context.arc(x, y, width/2, 0, 2 * Math.PI, false);
    context.fillStyle = "rgb(0, 0, 0)";
    context.fill();
    context.closePath();
}

async function drawBezier(context, p0, p1, p2, p3, width, style) {
    if (!(p0 && p1 && p2 && p3)) { return }

    style = style || "rgb(0, 0, 0)";
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = style;

    context.strokeCap = "round";

    let d = (p2[0] - p1[0]) + (p2[1] - p1[1]);

    let pLeft = getBezierRight(p0, p1, p2);
    let pRight = getBezierLeft(p1, p2, p3);

    context.moveTo(...p1);
    context.bezierCurveTo(...pLeft, ...pRight, ...p2, width);
    context.stroke();
    context.closePath();
}

function getBezierLeft(pl, p, pr) {
    [c, dummy] = getBezierPoints(pl, p, pr);
    return c;
}

function getBezierRight(pl, p, pr) {
    [dummy, c] = getBezierPoints(pl, p, pr);
    return c;
}

function getBezierPoints(p0, p1, p2) {
    let h = 0.25;

    let d = [ p2[0] - p0[0], p2[1] - p0[1] ];

    let d0 = Math.abs(p0[0] - p1[0]) + Math.abs(p0[1] - p1[1]);
    let d2 = Math.abs(p2[0] - p1[0]) + Math.abs(p2[1] - p1[1]);

    let s0 = h * d0 / (d0 + d2);
    let s2 = h * d2 / (d0 + d2);

    let cp1 = [ p1[0]  - s0 * d[0], p1[1]  - s0 * d[1] ];

    let cp2 = [ p1[0]  + s2 * d[0], p1[1]  + s2 * d[1] ];

    return [cp1, cp2];
}

async function drawLine(context, from, to, width, style) {
    //context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = style;
    context.moveTo(...from);
    context.lineTo(...to);
    context.stroke();
    //context.closePath();
}

function init(context) {
    context.canvas.width = width;
    context.canvas.height = height;
}

let debugState = false;
let debugElement = document.getElementById("test-container");

function toggleDebug(e) {
    if (debugState) {
        disableDebug();
    } else {
        enableDebug();
    }
}

function enableDebug() {
    debugState = true;
    debugElement.style.display = "flex";
    board.addEventListener('pointermove', testMove);
    board.addEventListener('pointerdown', testDown);
    board.addEventListener('pointerup', testUp);
}

function disableDebug() {
    debugState = false;
    debugElement.style.display = "none";
    board.removeEventListener('pointermove', testMove);
    board.removeEventListener('pointerdown', testDown);
    board.removeEventListener('pointerup', testUp);
}

function testMove(e) {
    let type = document.getElementById(e.pointerType);

    type.querySelector('#x').innerHTML = resolution*e.tiltX;
    type.querySelector('#y').innerHTML = resolution*e.tiltY;
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

