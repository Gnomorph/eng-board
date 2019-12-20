'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import { QuadNode } from "./QuadNode.js";
import { QuadData } from "./QuadData.js";
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

        this.testQuad = false;
        this.strokeQuad = new QuadNode(0, this.width, 0, this.height);

        this.bCtx.canvas.width = this.width;
        this.bCtx.canvas.height = this.height;
        this.fCtx.canvas.width = this.width;
        this.fCtx.canvas.height = this.height;
        this.biCtx.canvas.width = this.width;
        this.biCtx.canvas.height = this.height;
        this.clearScreen();

        this.buildGreenScreen();
        this.greenScreen();

        //window.addEventListener('resize', (e) => setTimeout(buildResizeCanvas(this), 100));
        window.addEventListener('resize', this.resize.bind(this), 100);

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

    resize() {
        setTimeout(() => {
            this.width  = Browser.width;
            this.height = Browser.height;

            this.bCtx.canvas.width = this.width;
            this.bCtx.canvas.height = this.height;
            this.fCtx.canvas.width = this.width;
            this.fCtx.canvas.height = this.height;
            this.biCtx.canvas.width = this.width;
            this.biCtx.canvas.height = this.height;

            this.buildGreenScreen();
            this.update();
        }, 100);
    }

    addEventListener(trigger, callback) {
        this.bgBoard.addEventListener(trigger, callback);
    }

    removeEventListener(trigger, callback) {
        this.bgBoard.removeEventListener(trigger, callback);
    }

    get tip() {
        return this._tip;
    }

    set tip(newTip) {
        this._tip = newTip;
    }

    update() {
        this.greenScreen();
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
                Draw.line(this.bCtx, last.x, last.y, point.x, point.y, 2);
            }

            last = point;
        }
    }

    eraseStroke(stroke) {
        let last = null;
        for (let point of stroke) {
            if (last) {
                Draw.erase(this.bCtx, this.biCtx, last.x, last.y, point.x, point.y);
            }

            last = point;
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
            //this.clearScreen();
            this.undoStack.length = 0;

            // create a new stroke
            let stroke = new Stroke(id, type);

            // add current point to the new stroke
            stroke.addXY(x, y, tiltX, tiltY);

            // add to stroke openStrokes
            // add to stroke strokeOrder
            this.openStrokes[id] = stroke;
            this.strokeOrder.push(stroke);

            if (stroke.type == "pen") {
                Draw.dot(this.bCtx, stroke.last.x, stroke.last.y, 2);
            } else if (stroke.type == "eraser") {
                Draw.blot(this.bCtx, this.biCtx, stroke.last.x, stroke.last.y, 25);
            }
        }
    }

    penMove(id, x, y, tiltX, tiltY) {
        if (id in this.openStrokes) {
            let stroke = this.openStrokes[id];
            let initial = stroke.last;

            // draw the stroke to the screen
            let current = new StrokePoint(x, y, tiltX, tiltY);
            if(stroke.type == "pen") {
                Draw.line(this.bCtx, initial.x, initial.y, current.x, current.y, 2);
            } else if (stroke.type == "eraser") {
                Draw.erase(this.bCtx, this.biCtx, initial.x, initial.y, current.x, current.y);
            }

            stroke.addXY(x, y, tiltX, tiltY);
        } else if (this.testQuad) {
            let scaleX = x*Browser.resolution;
            let scaleY = y*Browser.resolution;

            this.update();

            let nearest = this.strokeQuad.getValues(scaleX, scaleY);
            let bounds = this.strokeQuad.getBounds(scaleX, scaleY);

            for (let data of nearest) {
                Draw.line(this.bCtx, ...data._data, 3, "red");
            }

            for (let data of bounds) {
                data[0] += 1;
                data[1] -= 2;
                data[2] += 1;
                data[3] -= 2;
                Draw.box(this.bCtx, ...data, 3, "green");
            }
        }
    }

    penEnd(id, x, y, tiltX, tiltY) {
        // for mouse, start is unique, end is not
        // for touch, start is unique, end is not

        if (id in this.openStrokes) {
            let stroke = this.openStrokes[id];
            stroke.kill(id, this.terminateStroke.bind(this));

            this.addToQuadTree(stroke);

            if (this.testQuad) {
                let scaleX = x*Browser.resolution;
                let scaleY = y*Browser.resolution;
                let bounds = this.strokeQuad.getBounds(scaleX, scaleY);

                for (let data of bounds) {
                    data[0] += 1;
                    data[1] -= 2;
                    data[2] += 1;
                    data[3] -= 2;
                    Draw.box(this.bCtx, ...data, 2, "green");
                }
            }
        }
    }

    addToQuadTree(stroke) {
        let prev;
        for (let current of stroke) {
            if (prev) {
                let l = Math.min(prev.x, current.x);
                let r = Math.max(prev.x, current.x);
                let t = Math.min(prev.y, current.y);
                let b = Math.max(prev.y, current.y);

                let line = [prev.x, prev.y, current.x, current.y];
                this.strokeQuad.add(new QuadData(line, l, r, t, b));
            }

            prev = current;
        }
    }

    terminateStroke(id) {
        delete this.openStrokes[id];
    }

    clearScreen() {
        //this.strokeQuad = new QuadNode(0, this.width, 0, this.height);
        this.strokeQuad.purge();
        this.strokeOrder.length = 0;
        this.greenScreen();
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

    greenScreen() {
        this.bCtx.drawImage(this.biCtx.canvas, 0, 0, this.width, this.height);
    }
}

function buildResizeCanvas(surface) {
    return function (event) {
        this.width  = Browser.width;
        this.height = Browser.height;

        this.bgBoard.width = this.width;
        this.bgBoard.height = this.height;

        //this.
        this.update();
    }.bind(surface);
}
