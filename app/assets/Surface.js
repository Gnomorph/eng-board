'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import * as Draw from "./Draw.js";

import { Stroke } from "./Stroke.js";
import { StrokePoint } from "./StrokePoint.js";

function makeBoard() {
    let board = document.createElement('canvas');
    board.class = "offscreen";
    document.body.appendChild(board);
    return board;
}

export class Surface {
    constructor(canvas) {
        this.openStrokes = {};
        this.strokeOrder = [];

        this.tip = null;
        this.pointerIsActive = false;
        this.stroke = null;
        this.drawables = [];
        this.drawdones = [];
        this.hasUpdates = false;

        this.undoStack = [];

        this.bgBoard = canvas;
        this.fgBoard = makeBoard();
        this.biBoard = makeBoard();

        this.fCtx = this.fgBoard.getContext("2d", {desynchronized: true});
        this.fCtx.imageSmoothingEnabled = false;
        this.bCtx = this.bgBoard.getContext("2d", {desynchronized: true});
        this.bCtx.imageSmoothingEnabled = false;
        this.biCtx = this.biBoard.getContext("2d", {desynchronized: true});
        this.biCtx.imageSmoothingEnabled = false;

        this.width = Browser.width;
        this.height = Browser.height;

        this.bCtx.canvas.width = this.width;
        this.bCtx.canvas.height = this.height;
        this.fCtx.canvas.width = this.width;
        this.fCtx.canvas.height = this.height;
        this.biCtx.canvas.width = this.width;
        this.biCtx.canvas.height = this.height;
        this.clearScreen();

        this.buildGreenScreen();
        this.copyGreenScreen();

        window.addEventListener('resize', (e) => setTimeout(buildResizeCanvas(this), 100));

        // active
        // display
        // history -> first approximation, just redraw everything on active
        // resize -> you can probably just repaint everything

        // TODO erasers cause a big problem
        // this may require agressive path smoothing for older paths

        // you need one foregraound board for the active pen
        // only draw the active pen on here
        // draw with only straight lines
        // but actually, also draw the last 10 paths
        // redraw this completely every time the pen is lifted
        // do a screen dump every 1/60's sec
        // you need one background board that will be displayed
        // you can have one history board for long term history
        // you can have one history board for short term history
    }

    addEventListener(trigger, callback) {
        this.bgBoard.addEventListener(trigger, callback);
    }

    get tip() {
        return this._tip;
    }

    set tip(newTip) {
        this._tip = newTip;
    }

    update() {
        this.copyGreenScreen();
        let i = 0;
        for (let path of this.strokeOrder) {
            if (path.type == "pen") {
                this.drawStroke(path);
            } else if (path.type == "eraser") {
                this.eraseStroke(path);
            }

            i++;
        }
    }

    drawStroke(stroke) {
        let last = null;
        for (let point of stroke) {
            if (last) {
                this.tempDraw(last.x, last.y, point.x, point.y);
            }

            last = point;
        }
    }

    eraseStroke(stroke) {
        let last = null;
        for (let point of stroke) {
            if (last) {
                this.tempErase(last.x, last.y, point.x, point.y);
            }

            last = point;
        }
    }

    tempErase(xi, yi, xf, yf) {
        let size = 25
        //this.bCtx.clearRect(xf-size, yf-size, 2*size, 2*size);
        this.bCtx.drawImage(this.biCtx.canvas,
            xf-size, yf-size, 2*size, 2*size,
            xf-size, yf-size, 2*size, 2*size);
    }

    tempDraw(xi, yi, xf, yf) {
        if (xi && yi && xf && yf) {
            this.bCtx.beginPath();
            this.bCtx.stroke
            this.bCtx.lineWidth = 3;
            this.bCtx.lineCap = "round";
            this.bCtx.strokeStyle = "black";
            this.bCtx.moveTo(xi, yi);
            this.bCtx.lineTo(xf, yf);
            this.bCtx.stroke();
        }
    }

    penStart(id, type, x, y, tiltX, tiltY) {
        // for mouse, start is unique, end is not
        // for touch, start is unique, end is not

        // get undo ready
        if (id in this.openStrokes) {
            this.openStrokes[id].addXY(x, y, tiltX, tiltY);
            this.openStrokes[id].kill(null, null);
        } else {
            this.undoStack.length = 0;

            // create a new stroke
            let stroke = new Stroke(id, type);

            // add current point to the new stroke
            stroke.addXY(x, y, tiltX, tiltY);

            // add to stroke openStrokes
            // add to stroke strokeOrder
            this.openStrokes[id] = stroke;
            this.strokeOrder.push(stroke);
        }
    }

    penMove(id, x, y, tiltX, tiltY) {
        if (id in this.openStrokes) {
            let stroke = this.openStrokes[id];
            let initial = stroke.last;

            // draw the stroke to the screen
            let current = new StrokePoint(x, y, tiltX, tiltY);
            if(stroke.type == "pen") {
                this.tempDraw(initial.x, initial.y, current.x, current.y);
            } else if (stroke.type == "eraser") {
                this.tempErase(initial.x, initial.y, current.x, current.y);
            } else {
                console.log(stroke);
            }

            stroke.addXY(x, y, tiltX, tiltY);
        }

    }

    penEnd(id, x, y, tiltX, tiltY) {
        // for mouse, start is unique, end is not
        // for touch, start is unique, end is not

        if (id in this.openStrokes) {
            let stroke = this.openStrokes[id];
            stroke.kill(id, this.terminateStroke.bind(this));
        }
    }

    terminateStroke(id) {
        delete this.openStrokes[id];
    }

    clearScreen() {
        this.strokeOrder.length = 0;
        this.copyGreenScreen();
        // TODO: implement undo for clear
    }

    buildGreenScreen() {
        this.biCtx.clearRect(0, 0, this.width, this.height);
        this.biCtx.fillStyle = "#ccddcc";
        this.biCtx.rect(0, 0, this.width, this.height);
        this.biCtx.fill();

        this.biCtx.beginPath();
        this.biCtx.strokeStyle = "#99bbaa";
        this.biCtx.lineWidth = 1;
        for (let i=50*Browser.resolution; i<this.width; i+=50*Browser.resolution) {
            this.biCtx.moveTo(i, 0);
            this.biCtx.lineTo(i, this.height);
        }
        for (let i=50*Browser.resolution; i<this.height; i+=50*Browser.resolution) {
            this.biCtx.moveTo(0, i);
            this.biCtx.lineTo(this.width, i);
        }
        this.biCtx.stroke();
    }

    copyGreenScreen() {
        this.bCtx.drawImage(this.biCtx.canvas, 0, 0, this.width, this.height);
    }

    greenScreen() {
        this.copyGreenScreen();
        /*
    this.bCtx.clearRect(0, 0, this.width, this.height);
    this.bCtx.fillStyle = "#ccddcc";
    this.bCtx.rect(0, 0, this.width, this.height);
    this.bCtx.fill();

    this.bCtx.beginPath();
    this.bCtx.strokeStyle = "#99bbaa";
    this.bCtx.lineWidth = 1;
    for (let i=50*Browser.resolution; i<this.width; i+=50*Browser.resolution) {
        this.bCtx.moveTo(i, 0);
        this.bCtx.lineTo(i, this.height);
    }
    for (let i=50*Browser.resolution; i<this.height; i+=50*Browser.resolution) {
        this.bCtx.moveTo(0, i);
        this.bCtx.lineTo(this.width, i);
    }
    this.bCtx.stroke();
    */
    }
}

function buildResizeCanvas(surface) {
    return function (event) {
        this.width  = Browser.width;
        this.height = Browser.height;

        this.bgBoard.width = this.width;
        this.bgBoard.height = this.height;

        this.update();
    }.bind(surface);
}
