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
        this.pointerIsActive = false;
        this.stroke = null;
        this.drawables = [];
        this.drawdones = [];
        this.hasUpdates = false;

        this.undoStack = [];

        this.bgBoard = canvas;
        this.fgBoard = makeBoard();
        this.bsBoard = makeBoard();
        this.tpBoard = makeBoard();

        this.fCtx = this.fgBoard.getContext("2d", {desynchronized: true});
        this.fCtx.imageSmoothingEnabled = false;
        this.bCtx = this.bgBoard.getContext("2d", {desynchronized: true});
        this.bCtx.imageSmoothingEnabled = false;
        this.sCtx = this.bsBoard.getContext("2d", {desynchronized: true});
        this.sCtx.imageSmoothingEnabled = false;
        this.tCtx = this.bsBoard.getContext("2d", {desynchronized: true});
        this.tCtx.imageSmoothingEnabled = false;

        //console.log(this.fCtx.getContextAttributes().desynchronized);

        this.width = Browser.width;
        this.height = Browser.height;

        this.bCtx.canvas.width = this.width;
        this.bCtx.canvas.height = this.height;
        this.fCtx.canvas.width = this.width;
        this.fCtx.canvas.height = this.height;
        this.bsBoard.width = this.width;
        this.bsBoard.height = this.height;
        this.tCtx.canvas.width = this.width;
        this.tCtx.canvas.height = this.height;
        this.clearScreen();

        this.greenScreen();
        this.fpsTimer = setInterval(buildCopyScreens(this), 1);

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
        this.drawables.length = 0;
        this.drawdones.length = 0;
        this.tCtx.clearRect(0, 0, this.width, this.height);
        this.greenScreen();
        // TODO: implement undo for clear
        //this.undoStack.push(JSON.parse(JSON.stringify(this.drawables)));

        //this.fCtx.clearRect(0, 0, this.width, this.height);
        //this.sCtx.clearRect(0, 0, this.width, this.height);
        //this.sCtx.clearRect(0, 0, this.width, this.height);
    }

    logStart(id, point, e) {
        //this.eventCount = 0;
        //this.eventStart = Date.now();

        this.undoStack.length = 0;
        this.pointerIsActive = this.pointerIsActive || id;
        this.currentPoint = point;


        //this.stroke = new Path(id, 5, 0.25, Browser.resolution, "#000000");
        this.stroke = new Path(id, 5, 0.0, Browser.resolution, "#000000");
        this.stroke.push(point);
        this.drawables.push(this.stroke);

    }

    logMove(id, point, pressure, tilt, e) {
        if (this.pointerIsActive === id) {
            //this.eventCount++;

            //this.hasUpdates = true;
            //if (this.drawables[this.drawables.length-1] != null) {
                //this.drawables[this.drawables.length-1].push(point);
            //}

            this.bCtx.beginPath();
            this.bCtx.stroke
            this.bCtx.lineWidth = 2;
            this.bCtx.lineCap = "round";
            this.bCtx.strokeStyle = "black";
            this.bCtx.moveTo(...this.currentPoint);
            this.bCtx.lineTo(...point);
            this.bCtx.stroke();
            this.currentPoint = point;
        }
    }

    logEnd(id, e) {
        //this.eventCount++;
        //let timeDelta = (Date.now()-this.eventStart);
        //console.log("average time per draw: ", timeDelta/this.eventCount);

        this.pointerIsActive = false;
        if (this.drawables.length > 0) {
            let inked = this.drawables.shift();

            this.drawdones.push(inked);
            //this.hasUpdates = true;
            //this.fCtx.clearRect(0, 0, this.width, this.height);

            //Draw.curves(this.tCtx, inked, 5, "#000000");
        }
    }

    erase(id, point) {
        //this.pen.id = id;
        //this.pen.erase(this.fCtx, point);
    }

    strokeDraw() {
        //for (let drawable of this.drawables) {
            //Draw.lines(this.fCtx, drawable, 5, "#000000");
        //}
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

function buildCopyScreens(surface) {
    return function(e) {
        // Only draw if there are updates to draw
        if (this.hasUpdates) {
            this.hasUpdates = false;

            // Draw all of the drawables to the foreground
            for (let drawable of this.drawables) {
                Draw.lines(this.fCtx, drawable, 5, "#000000");
            }

            // draw the background paper on the background canvas
            this.greenScreen();

            // Copy the foreground to the background
            this.bCtx.drawImage(this.tCtx.canvas, 0, 0);
            this.bCtx.drawImage(this.fCtx.canvas, 0, 0);

            // clear the foreground
            this.fCtx.clearRect(0, 0, this.width, this.height);
        }
    }.bind(surface);
}

function buildResizeCanvas(surface) {
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
    }.bind(surface);
}
