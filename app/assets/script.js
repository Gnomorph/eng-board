/**********
 *
 *  Define Constants
 *
 **********/
//const resolution = 2;
const resolution = window.devicePixelRatio;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
let debugState = false;
let debugMenu = document.getElementById("debug-menu");

let width  = resolution*getWidth();
let height = resolution*getHeight();
let colorList = [
    [ "black", "#000000"],
    [ "red", "#ff0000"],
    [ "maroon", "#800000"],
    [ "green", "#00a000"],
    [ "darkgreen", "#106010"],
    [ "blue", "#0000ff"],
    [ "deepblue", "#000080"],
    [ "purple", "#800080"],
    [ "violet", "#ee82ee"],
    [ "indigo", "#4b0082"],
    [ "yellow", "#d0d000"],
    [ "aqua", "#008080"],
    [ "teal", "#00cccc"],
    [ "brown", "#421010"],
    [ "grey", "#808080"],
];

/**********
 *
 *  Helper Methods
 *
 **********/
function getWidth() {
    return window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
}

function getHeight() {
    return window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
}

/**********
 *
 *  Class Definitions
 *
 **********/
class Pointer {
    constructor(id, width, pressureThreashold) {
        this.hasUpdates = false;
        this._id = id;
        this.width = width;
        this.pressureThreashold = pressureThreashold;
        this.color = "#000000";
        this.lastPressure = 1;
        this.currentPressure = 1;
        this.tip = "pen";

        this.clearHistory();
    }

    get id() {
        return this.id;
    }

    set id(value) {
        if (this._id != value) {
            this._id = value;
            this.clearHistory();
        }

        if (this._id == 1) {
            this.type = "mouse";
        }
    }

    get pressure() {
        return this.currentPressure;
    }

    set pressure(value) {
        this.lastPressure = this.currentPressure;

        if (value < this.pressureThreashold) {
            this.currentPressure = this.pressureThreashold;
        } else {
            this.currentPressure = value;
        }

    }

    clearHistory() {
        this.type = "eraser";
        this.history = [null, null, null, null];
    }

    flushHistory() {
        this.type = "eraser";
        this.history[1] = null;
        this.history[2] = null;
        this.history[3] = null;
    }

    hasTilt(tiltX, tiltY) {
        if (tiltX != 0 || tiltY != 0) {
            this.type = "pen";
            this.tip = "pen";
            return true;
        } else if (this.type === "pen") {
            return true;
        } else {
            return false;
        }
    }

    async pushHistory(point){
        this.history[0] = this.history[1];
        this.history[1] = this.history[2];
        this.history[2] = this.history[3];
        this.history[3] = point;
    }

    async draw(context, point) {
        if (this.tip == "pen") {
            this.drawPen(context, point);
        } else if (this.tip == "pencil") {
            this.drawPencil(context, point);
        } else if (this.tip == "highlighter") {
            this.drawHighlighter(context, point);
        } else if (this.tip == "eraser") {
            this.erase(context, point);
        }
    }

    async drawPen(context, point) {
        this.hasUpdates = true;

        this.pushHistory(point);

        let pressureWidth = this.pressure * this.width;
        context.globalAlpha = 1;
        drawBezier(context, ...this.history, pressureWidth, this.color);
    }

    async drawPencil(context, point) {
        this.hasUpdates = true;

        this.pushHistory(point);

        let pressureWidth = this.pressure * this.width;
        context.globalAlpha = 0.8;
        drawBezier(context, ...this.history, pressureWidth, this.color);

    }

    async drawHighlighter(context, point) {
        this.hasUpdates = true;
        //console.log("drawing", this.type, this.tip);

        let d = 25*resolution;
        let x = point[0];
        let y = point[1];

        context.globalAlpha = 0.01;
        context.beginPath();
        context.fillStyle = "yellow";
        context.rect(x-d, y-d, 2*d, 2*d);
        context.fill();
    }

    async erase(context, point) {
        this.hasUpdates = true;

        let d = 25*resolution;
        let x = point[0];
        let y = point[1];

        context.clearRect(x-d, y-d, 2*d, 2*d);
    }

}

let fpsTimer;

var fgBoard = document.getElementById("fg-board");
var bgBoard = document.getElementById("bg-board");
var bsBoard = document.getElementById("bs-board");

var settingsButton = document.getElementById("settings-button");
var fCtx = fgBoard.getContext("2d");
var bCtx = bgBoard.getContext("2d");
var sCtx = bsBoard.getContext("2d");

let last = [0, 0];
let pen = new Pointer(null, 4, 0.25);
let stylus = new Pointer(null, 4, 0.25);
let timerId = null;
let touchEnabled = false;

let nw = document.getElementById('nw');
let ne = document.getElementById('ne');
let sw = document.getElementById('sw');
let se = document.getElementById('se');

init(fCtx, bCtx);

bgBoard.addEventListener('pointermove', pointHere);
bgBoard.addEventListener('pointerdown', startPoint);
bgBoard.addEventListener('pointerup', stopPoint);
//bgBoard.addEventListener('click', clickPoint);

window.addEventListener('resize', (e) => setTimeout(resizeCanvas(e), 100));

function resizeCanvas(event) {
    return function() {
        width  = resolution*getWidth();
        height = resolution*getHeight();

        let minWidth = width;
        minWidth = Math.max(minWidth, fgBoard.width);
        minWidth = Math.max(minWidth, bgBoard.width);
        minWidth = Math.max(minWidth, bsBoard.width);

        let minHeight = height;
        minHeight = Math.max(minHeight, fgBoard.height);
        minHeight = Math.max(minHeight, bgBoard.height);
        minHeight = Math.max(minHeight, bsBoard.height);

        pen.hasUpdates = true;
        stylus.hasUpdates = true;

        sCtx.drawImage(fgBoard, 0, 0);

        bgBoard.width = width;
        bgBoard.height = height;
        bCtx.clearRect(0, 0, bgBoard.width, bgBoard.height);
        bCtx.drawImage(bsBoard, 0, 0);

        fgBoard.width = minWidth;
        fgBoard.height = minHeight;
        fCtx.clearRect(0, 0, fgBoard.width, fgBoard.height);

        fCtx.drawImage(bsBoard, 0, 0);

        bsBoard.width = minWidth;
        bsBoard.height = minHeight;
        sCtx.drawImage(fgBoard, 0, 0);
        /*
        let oWidth = document.getElementById('width');
        let oHeight = document.getElementById('height');
        oWidth.innerHTML = getWidth();
        oHeight.innerHTML = getHeight();
        */
    }
}

document.getElementById("save").addEventListener('click', myFullscreen);
function myFullscreen(e) {
    var elem = document.getElementById("bg-board");
    elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

document.body.addEventListener('click', bodyClick);
const subMenuPattern = /sub-menu/;
let activeSubMenu = null;
function bodyClick(e) {
    if (!subMenuPattern.test(e.target.className) && activeSubMenu) {
        activeSubMenu.style.display = "none";
    }
}

function makeShowSubMenu(tip, menu) {
    return function(e) {
        if (activeSubMenu) {
            activeSubMenu.style.display = "none";
        }

        pen.tip = tip.id;
        activeSubMenu = menu;
        activeSubMenu.style.display = "flex";
        e.cancelBubble = true;
    }
}

const menuMap = [
    [ document.getElementById('pen'),
        document.getElementById('pen-submenu') ],
    [ document.getElementById('pencil'),
        document.getElementById('pencil-submenu') ],
    [ document.getElementById('highlighter'),
        document.getElementById('highlighter-submenu') ],
    [ document.getElementById('eraser'),
        document.getElementById('eraser-submenu') ],
];

for (let map of menuMap) {
    map[0].addEventListener('click', makeShowSubMenu(...map));
}
//document.getElementById('pen-menu').addEventListener('click', makeShowSubMenu(
//document.getElementById('pen-submenu')));

settingsButton.addEventListener('click', toggleDebug);

document.getElementById('trash').addEventListener('click', clearScreen, false);

function clearScreen() {
    pen.hasUpdates = true;
    stylus.hasUpdates = true;
    fCtx.clearRect(0, 0, fgBoard.width, fgBoard.height);
    sCtx.clearRect(0, 0, bsBoard.width, bsBoard.height);
}


if ('ontouchstart' in window) {
    let canvas = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("touchstart", handleAll, false);
    canvas.addEventListener("touchend", handleAll, false);
    canvas.addEventListener("touchcancel", handleAll, false);
    canvas.addEventListener("touchmove", handleAll, false);
}

function getPens(touchList) {
    let i;
    let pens = [];
    for (i=0; i<touchList.length; i++) {
        let touch = touchList[i];
        if (touch.touchType == "stylus") {
            pens.push(touch);
        }
    }

    //return i;
    return pens;
}

function testEraser(touch) {
    let x = resolution*touch.clientX;
    let y = resolution*touch.clientY;
    return (x > width-resolution*100) && (y > height-resolution*100);
}

function getErasers(touchList) {
    let enabled = false;
    let erasers = [];

    let i;
    for (i=0; i<touchList.length; i++) {
        let touch = touchList[i];
        //if (enabled && touch.touchType == "direct") {
        if (enabled) {
            erasers.push(touch);
        }
        enabled = enabled || testEraser(touch);
    }

    return erasers;
}

function handleAll(e) {
    e.preventDefault();

    let pens = getPens(e.touches);
    let erasers = getErasers(e.touches);

    if (pens.length > 0) {
        let pen = pens[0];
        let pt = [ resolution*pen.clientX, resolution*pen.clientY ];
        stylus.id = pen.identifier;
        stylus.pressure = pen.force;
        stylus.draw(fCtx, pt);
    } else if (erasers.length > 0){
        for (let eraser of erasers) {
            let pt = [ resolution*eraser.clientX, resolution*eraser.clientY ];
            stylus.erase(fCtx, pt);
        }
    }
}

function touchHere(tp) {
    if (tp.touchType=="stylus") {
        let t3 = [ resolution*tp.clientX, resolution*tp.clientY ];
        stylus.id = tp.identifier;
        stylus.type = "pen";
        stylus.tip = "pen";

        stylus.pressure = tp.force;
        stylus.draw(fCtx, t3);
    } else if (tp.touchType=="touch" && touchEnabled) {
        // touch support
    }
}

let penId;
function pointHere(e) {
    let n3 = [ resolution*e.clientX, resolution*e.clientY ];
    if (e.pointerType=="pen") {
        pen.id = e.pointerId;
        pen.hasTilt(e.tiltX, e.tiltY);

        if (e.buttons == "2") {
        } else if (e.buttons == "1") {
            if (pen.type == "pen") {
                pen.pressure = e.pressure;
                //pen.draw(fCtx, n3);
            } else if (pen.type == "eraser") {
                pen.tip = "eraser";
                //pen.erase(fCtx, n3);
            }
            pen.draw(fCtx, n3);
        } else if (e.pressure != 0){
            pen.pressure = e.pressure;
            pen.draw(fCtx, [ e.clientX, resolution*e.clientY ]);
        } else {
            pen.pushHistory(n3);
        }
    } else if (e.pointerType=="mouse") {
        pen.id = e.pointerId;
        pen.type = "pen";
        //pen.hasTilt(e.tiltX, e.tiltY);

        if (e.buttons == "1") {
            pen.pressure = 1;
            pen.draw(fCtx, n3);
        } else if (e.buttons == "4") {
            //console.log("erase");
            pen.erase(fCtx, n3);
        } else {
            pen.pushHistory(n3);
        }
    } else if (penId == e.pointerId && e.pointerType == "touch") {
        // legacy/default pen support
    } else if (e.pointerType=="touch" && touchEnabled && e.buttons=="1") {
        // touch support
    }
}

function drawPage() {
    //let path = JSON.parse(JSON.stringify(stroke));
    let path = stroke;
    //stroke = [path[path.length-1]];
}

function drawRadial(x, y) {
    nw.style.display = "initial";
    sw.style.display = "initial";
    ne.style.display = "initial";
    se.style.display = "initial";

    nw.style.left = (x - 144) + "px";
    ne.style.left = (x) + "px";
    sw.style.left = (x - 144) + "px";
    se.style.left = (x) + "px";

    nw.style.top = (y - 144) + "px";
    ne.style.top = (y - 144) + "px";
    sw.style.top = (y) + "px";
    se.style.top = (y) + "px";
}

function hideRadial(x, y) {
    nw.style.display = "none";
    sw.style.display = "none";
    ne.style.display = "none";
    se.style.display = "none";
}

function startPoint(e) {
    if (e.pointerType == "mouse" && e.buttons == "2") {
        //e.preventDefault();
        drawRadial(e.clientX, e.clientY);
    }

    console.log("in", e);
    if (e.buttons == "2") {
        pen.clearHistory();
        console.log("TWO");
        return;
    }

    let activeSubMenu = null;
    let current = [resolution*e.clientX, resolution*e.clientY];
    pen.pushHistory(current);
    pen.history[0] = null;
    pen.history[1] = null;

    if (e.mozInputSource == 2 || e.mozInputSource == 1) {
        //drawArc(fCtx, current, 10*resolution, '#0000ff');
    }
}

function stopPoint(e) {
    console.log("out", e);
    if (e.buttons == "2") {
        console.log("TWO");
        return;
    }

    let current = [resolution*e.clientX, resolution*e.clientY];

    // TODO
    // you should actually just draw the last point
    if (e.mozInputSource == 1) {
        //drawArc(fCtx, current, 2*resolution, '#ff00ff');
    } else if (e.mozInputSource == 2 && pen.type=="pen" && pen.tip=="pen") {
        drawLine(fCtx, pen.history[3], current, 0, pen.color, 10);
        //drawArc(fCtx, current, 2*resolution, '#ff00ff');
    }
}

async function drawArc(context, point, width, style) {
    context.beginPath();
    context.lineWidth = 0;
    context.strokeStyle = style;
    context.arc(...point, width/2, 0, 2 * Math.PI, false);
    context.fillStyle = style || "rgb(0, 0, 0)";
    context.closePath();
    context.fill();
}

async function drawPoint(context, x, y, width, style) {
    context.beginPath();
    context.lineWidth = 0;
    context.arc(x, y, width/2, 0, 2 * Math.PI, false);
    context.fillStyle = style || "rgb(0, 0, 0)";
    context.fill();
    //context.closePath();
}

async function drawBezier(context, p0, p1, p2, p3, width, style) {
    if (!(p0 && p1 && p2 && p3)) { return }

    style = style || "rgb(0, 0, 0)";
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = style;

    //context.lineCap = "round";

    let dabs = Math.abs(p2[0] - p1[0]) + Math.abs(p2[1] - p1[1]);
    //let d = (p2[0] - p1[0]) + (p2[1] - p1[1]);

    context.moveTo(...p1);

    // always draw bezier
    //context.bezierCurveTo(...pLeft, ...pRight, ...p2, width);
    if (dabs*resolution > width) {
        let pLeft = getBezierRight(p0, p1, p2);
        let pRight = getBezierLeft(p1, p2, p3);

        //context.strokeStyle = "#00ff00";
        context.bezierCurveTo(...pLeft, ...pRight, ...p2, width);

        context.stroke();

        //drawArc(context, pLeft, width, "#ff0000");
        //drawArc(context, pRight, width, "#00ff00");
        //context.lineTo(...p2, width);
    } else {
        //context.strokeStyle = "#ff0000";
        //style = "#0000ff";
        context.lineTo(...p2, width);
        context.stroke();
        drawArc(context, p1, width, style);
        drawArc(context, p2, width, style);
    }

    //style = "#0000ff";
    //drawArc(context, p1, width, style);
    //drawArc(context, p2, width, style);
    //always draw the arc
    //if (dabs*resolution < 100*width) {
        //drawArc(context, p1, width, style);
        //drawArc(context, p2, width, style);
    //}
}

function getBezierLeft(pl, p, pr) {
    [c, dummy] = getBezierPoints(pl, p, pr);
    return c;
}

function getBezierRight(pl, p, pr) {
    [dummy, c] = getBezierPoints(pl, p, pr);
    return c;
}

function getBezierPoints(pl, pc, pr) {
    let h = 0.4;
    //let h = 1;

    //let d = [ pr[0] - pl[0], pr[1] - pl[1] ];
    let Dx = pr[0] - pl[0];
    let Dy = pr[1] - pl[1];

    let Dl = Math.sqrt(Math.pow(pl[0] - pc[0], 2) + Math.pow(pl[1] - pc[1], 2));
    let Dr = Math.sqrt(Math.pow(pr[0] - pc[0], 2) + Math.pow(pr[1] - pc[1], 2));
    //let d0 = Math.abs(pl[0] - pc[0]) + Math.abs(pl[1] - pc[1]);
    //let d2 = Math.abs(pr[0] - pc[0]) + Math.abs(pr[1] - pc[1]);

    let sl = h * Dl / (Dl + Dr);
    let sr = h * Dr / (Dl + Dr);

    let dlx = sl*Dx;
    let dly = sl*Dy;

    let drx = sr*Dx;
    let dry = sr*Dy;

    let cp1 = [ pc[0]  - dlx, pc[1]  - dly ];

    let cp2 = [ pc[0]  + drx, pc[1]  + dry ];

    return [cp1, cp2];
}

async function drawLine(context, from, to, pressure, style, interpolate) {
    if (!from) { return; }

    pen.hasUpdates = true;
    interpolate = interpolate || false;
    context.lineWidth = width;
    context.strokeStyle = style;
    context.moveTo(...from);
    //context.lineTo(0, 0);
    //context.stroke();
    if (interpolate) {
        pressure = Math.max(pressure, pen.pressureThreashold);
        let dp = (pressure - pen.pressure)/interpolate;
        let dx = (to[0] - from[0])/interpolate;
        let dy = (to[1] - from[1])/interpolate;

        let ip = pen.pressure;
        let ix = from[0];
        let iy = from[1];
        //console.log("pressure: ", dp);
        //console.log("position: ", dx, dy);
        for (let i=0; i<interpolate; i++) {
            context.beginPath();
            context.moveTo(ix, iy);
            ip += dp;
            ix += dx;
            iy += dy;

            let randStyle = "";
            do {
                randStyle = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
            } while (randStyle.length != 7);

            //context.strokeStyle = randStyle
            context.strokeStyle = style;
            context.lineWidth = pen.width*ip;
            context.lineTo(ix, iy);
            context.stroke();
        }
    } else {
        context.beginPath();
        context.lineTo(...to);
        context.stroke();
    }
}

function nwClick(e) {
    console.log("nw");
    hideRadial();
}

function swClick(e) {
    console.log("sw");
    hideRadial();
}

function neClick(e) {
    console.log("ne");
    hideRadial();
}

function seClick(e) {
    console.log("se");
    hideRadial();
}

function init(foreground, background) {
    hideRadial();
    nw.addEventListener("click", nwClick);
    ne.addEventListener("click", neClick);
    sw.addEventListener("click", swClick);
    se.addEventListener("click", seClick);
    // disable right click
    document.body.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });


    let penColors = document.getElementById('color-container');
    let penWidth = document.getElementById('pen-width-slider');
    let penWidthOut = document.getElementById('pen-width-value');

    let oBrowser = document.getElementById('browser');
    oBrowser.innerHTML = isSafari ? "safari" : "firefox";

    let oWidth = document.getElementById('width');
    let oHeight = document.getElementById('height');
    oWidth.innerHTML = getWidth();
    oHeight.innerHTML = getHeight();

    penWidth.addEventListener('input', function(e) {
        penWidthOut.innerHTML = penWidth.value;
    });

    penWidth.addEventListener('change', function(e) {
        pen.width = penWidth.value;
        stylus.width = penWidth.value;
    });

    pen.width = 5;
    stylus.width = 5;
    penWidthOut.innerHTML = 5;
    penWidth.value = 5;

    for (let color of colorList) {
        var colorButton = document.createElement("div");
        colorButton.id = "pen-" + color[0];
        colorButton.style.backgroundColor = color[1];
        colorButton.title = color[0];
        colorButton.style.width = "50px";
        colorButton.style.height = "50px";

        colorButton.addEventListener('click', function(e) {
            pen.color = color[1];
            stylus.color = color[1];
        });

        penColors.appendChild(colorButton);
    }

    background.canvas.width = width;
    background.canvas.height = height;
    foreground.canvas.width = width;
    foreground.canvas.height = height;
    bsBoard.width = width;
    bsBoard.height = height;
    clearScreen();

    greenScreen();
    fpsTimer = setInterval(buildCopyScreens(background, foreground), 30);
    pen.color = "#000000";
    stylus.color = "#000000";
}

function buildCopyScreens(bg, fg) {
    return function(e) {
        if (stylus.hasUpdates) {
            stylus.hasUpdates = false;
            greenScreen();
            bg.drawImage(fg.canvas, 0, 0);
        }

        if (pen.hasUpdates) {
            pen.hasUpdates = false;
            greenScreen();
            bg.drawImage(fg.canvas, 0, 0);
        }
    }
}

function greenScreen() {
    bCtx.clearRect(0, 0, fgBoard.width, fgBoard.height);
    bCtx.fillStyle = "#ccddcc";
    bCtx.rect(0, 0, width, height);
    bCtx.fill();

    bCtx.beginPath();
    bCtx.strokeStyle = "#99bbaa";
    bCtx.lineWidth = 1;
    for (let i=50*resolution; i<width; i+=50*resolution) {
        bCtx.moveTo(i, 0);
        bCtx.lineTo(i, height);
    }
    for (let i=50*resolution; i<height; i+=50*resolution) {
        bCtx.moveTo(0, i);
        bCtx.lineTo(width, i);
    }
    bCtx.stroke();
}

function toggleDebug(e) {
    if (debugState) {
        disableDebug();
    } else {
        enableDebug();
    }
}

function enableDebug() {
    debugState = true;
    debugMenu.style.display = "flex";
    bgBoard.addEventListener('pointermove', testMove);
    bgBoard.addEventListener('pointerdown', testDown);
    bgBoard.addEventListener('pointerup', testUp);
}

function disableDebug() {
    debugState = false;
    debugMenu.style.display = "none";
    bgBoard.removeEventListener('pointermove', testMove);
    bgBoard.removeEventListener('pointerdown', testDown);
    bgBoard.removeEventListener('pointerup', testUp);
}

function testMove(e) {
    //console.log(e);
    let type = document.getElementById(e.pointerType + "-debug");

    type.querySelector('#x').innerHTML = resolution*e.clientX;
    type.querySelector('#y').innerHTML = resolution*e.clientY;
    type.querySelector('#buttons').innerHTML = e.buttons;
    type.querySelector('#pressure').innerHTML = e.pressure.toFixed(3);
    type.querySelector('#tiltx').innerHTML = e.tiltX;
    type.querySelector('#tilty').innerHTML = e.tiltY;
    type.querySelector('#id').innerHTML = e.pointerId;
}

function testUp(e) {
    let type = document.getElementById(e.pointerType + "-debug");

    type.querySelector('#state').innerHTML = "up";
}

function testDown(e) {
    let type = document.getElementById(e.pointerType + "-debug");

    type.querySelector('#state').innerHTML = "dn";
}

