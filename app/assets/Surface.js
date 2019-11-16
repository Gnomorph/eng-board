'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import * as Draw from "./Draw.js";

function makeBoard() {
    let board = document.createElement('canvas');
    board.class = "offscreen";
    document.body.appendChild(board);
    return board;
}

export class Surface {
    constructor(canvas) {
        this.tip = null;
        //this.pen = new Pointer(null, 5, 0.25, Browser.resolution, "#000000");
        //this.stroke = new Path(null, 5, 0.25, Browser.resolution, "#000000");
        this.drawables = [];
        this.hasUpdates = false;

        this.bgBoard = canvas;
        this.fgBoard = makeBoard();
        this.bsBoard = makeBoard();

        this.fCtx = this.fgBoard.getContext("2d");
        this.bCtx = this.bgBoard.getContext("2d");
        this.sCtx = this.bsBoard.getContext("2d");

        this.width = Browser.width;
        this.height = Browser.height;

        this.bCtx.canvas.width = this.width;
        this.bCtx.canvas.height = this.height;
        this.fCtx.canvas.width = this.width;
        this.fCtx.canvas.height = this.height;
        this.bsBoard.width = this.width;
        this.bsBoard.height = this.height;
        this.clearScreen();

        this.greenScreen();
        this.fpsTimer = setInterval(buildCopyScreens(this), 30);

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

    clearScreen() {
        this.hasUpdates = true;
        this.fCtx.clearRect(0, 0, this.width, this.height);
        this.sCtx.clearRect(0, 0, this.width, this.height);
    }

    logStart(id, point) {
        this.stroke = new Path(id, 5, 0.25, Browser.resolution, "#000000");
        this.stroke.push(point);
        //this.pen.pushHistory(point);
        //this.pen.buffer.length = 2;
    }

    logMove(id, point, pressure, tilt) {
        if (this.stroke != null) {
            this.stroke.push(point);
        }
    }

    logEnd() {
        this.drawables.push(this.stroke);
        this.stroke = null;
    }

    erase(id, point) {
        //this.pen.id = id;
        //this.pen.erase(this.fCtx, point);
    }

    strokeDraw() {
        this.hasUpdates = true;
        Draw.lines(this.fCtx, this.drawables.pop(), 5, "#000000");
    }

    penDraw(id, point, pressure, tilt) {
        //this.pen.id = id;
        //this.pen.draw(this.fCtx, point, this.tip.width);
    }

    mouseDraw(id, point) {
        //this.pen.id = id;
        //this.pen.type = "pen";
        //this.pen.pressure = 1;
        //this.pen.draw(this.fCtx, point, this.tip.width);
    }

    greenScreen() {
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
    }
}

function buildCopyScreens(vm) {
    return function(e) {
        if (this.hasUpdates) {
            this.hasUpdates = false;
            this.greenScreen();
            this.bCtx.drawImage(vm.fCtx.canvas, 0, 0);
        }
    }.bind(vm);
}

function buildResizeCanvas(vm) {
    return function (event) {
        this.width  = Browser.width;
        this.height = Browser.height;

        let minWidth = this.width;
        minWidth = Math.max(minWidth, this.width);
        minWidth = Math.max(minWidth, this.width);
        minWidth = Math.max(minWidth, this.width);

        let minHeight = this.height;
        minHeight = Math.max(minHeight, this.height);
        minHeight = Math.max(minHeight, this.height);
        minHeight = Math.max(minHeight, this.height);

        this.hasUpdates = true;

        this.sCtx.drawImage(this.fgBoard, 0, 0);

        this.bgBoard.width = this.width;
        this.bgBoard.height = this.height;
        this.bCtx.clearRect(0, 0, this.width, this.height);
        this.bCtx.drawImage(this.bsBoard, 0, 0);

        this.fgBoard.width = minWidth;
        this.fgBoard.height = minHeight;
        this.fCtx.clearRect(0, 0, this.width, this.height);

        this.fCtx.drawImage(this.bsBoard, 0, 0);

        this.bsBoard.width = minWidth;
        this.bsBoard.height = minHeight;
        this.sCtx.drawImage(this.fgBoard, 0, 0);
    }.bind(vm);
}
