'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import { QuadTree } from "./QuadTree.js";
import * as Draw from "./Draw.js";

import { Stroke } from "./Stroke.js";
import { StrokePoint } from "./StrokePoint.js";
import { StrokeSegment } from "./StrokeSegment.js";

function makeBoard(width, height) {
    let board = document.createElement('canvas');
    board.class = "offscreen";
    board.width = width;
    board.height = height;
    document.body.appendChild(board);
    return board;
}

function getMinimalContext (canvas) {
    let ctx = canvas.getContext("2d", {desynchronized: true});
    ctx.imageSmoothingEnabled = false;
    return ctx;
}

export class Surface {
    constructor(canvas) {
        // History and Undo Setup
        this.openStrokes = {};
        this.strokeOrder = [];
        this.undoStack = [];
        this.eraserStrokeLast = [];

        // Quad Tree Setup
        this.strokeQuad = new QuadTree(0, 2*this.width, 0, 2*this.height);

        // Canvas and Context Setup
        this.board = canvas;
        this.board.width = this.width;
        this.board.height = this.height;

        // Make Offscreen Canvases
        this.sheet = makeBoard(this.width, this.height);

        // Setup Each Context
        this.bCtx = getMinimalContext(this.board);
        this.sheetCtx = getMinimalContext(this.sheet);

        this.clearScreen();

        this.buildGreenScreen();
        this.greenScreen();

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

    get width() { return Browser.width; }

    get height() { return Browser.height; }

    resize() {
        setTimeout(() => {
            this.board.width = this.width;
            this.board.height = this.height;

            this.sheet.width = this.width;
            this.sheet.height = this.height;

            this.buildGreenScreen();
            this.update();
        }, 100);
    }

    addEventListener(trigger, callback) {
        this.board.addEventListener(trigger, callback);
    }

    removeEventListener(trigger, callback) {
        this.board.removeEventListener(trigger, callback);
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
            if (!path.deleted) {
                if (path.type == "pen") {
                    this.drawStroke(path);
                } else if (path.type == "eraser") {
                    //TODO Stroke Eraser Test
                    //this.eraseStroke(path);
                }
            }

            i++;
        }
    }

    drawStroke(stroke, color) {
        color = color || "black"
        let last = null;
        for (let point of stroke) {
            if (last) {
                Draw.line(this.bCtx, last.x, last.y, point.x, point.y, 2, color);
            }

            last = point;
        }
    }

    eraseStroke(stroke) {
        let last = null;
        for (let point of stroke) {
            if (last) {
                Draw.erase(this.bCtx, this.sheetCtx, last.x, last.y, point.x, point.y);
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
                //Draw.blot(this.bCtx, this.sheetCtx, stroke.last.x, stroke.last.y, 25);
                //TODO - Stroke Eraser Test
                this.eraserStrokeLast = [
                    stroke.last.x,
                    stroke.last.y
                ];
            }
        }
    }

    penMove(id, x, y, tiltX, tiltY) {
        if (id in this.openStrokes) {
            let stroke = this.openStrokes[id];
            let prev = stroke.last;

            // draw the stroke to the screen
            let cur = new StrokePoint(x, y, tiltX, tiltY);
            if(stroke.type == "pen") {
                Draw.line(this.bCtx, prev.x, prev.y, cur.x, cur.y, 2);
            } else if (stroke.type == "eraser") {
                //Draw.erase(this.bCtx, this.sheetCtx, prev.x, prev.y, cur.x, cur.y);
                //TODO Stroke Eraser Test
                //this.eraserStroke.push( [cur.x, cur.y] );

                this.update();
                if (this.eraserStrokeLast) {
                    this.strokeErase(
                        this.eraserStrokeLast[0], this.eraserStrokeLast[1],
                        x, y);
                }

                this.eraserStrokeLast[0] = x;
                this.eraserStrokeLast[1] = y;
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

            if (stroke.type == "pen") {
                this.addToQuadTree(stroke);
            } else if (stroke.type == "eraser") {
                if (this.eraserStrokeLast) {
                    this.strokeErase(
                        this.eraserStrokeLast[0], this.eraserStrokeLast[1],
                        x, y);
                }
                this.eraserStrokeLast = [];
                this.update();
            }
        }
    }

    strokeErase(x1, y1, x2, y2) {
        let stroke = new StrokeSegment(null, [x1, y1], [x2, y2]);

        //console.log("Erase:", this.strokeQuad.getRect(...stroke));
        // TODO now you can erase stuff
        // Check all the strokes to see if they cross anything in the quadtree

        Draw.line(this.bCtx, x1, y1, x2, y2, 1, "red");

        for (let data of this.strokeQuad.getRect(...stroke)) {
            //console.log(data);
            if (stroke.intersects(data._data)) {
                data._data.stroke._deleted = true;
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

                let p1 = [prev.x, prev.y];
                let p2 = [current.x, current.y];

                let segment = new StrokeSegment(stroke, p1, p2);
                this.strokeQuad.add(segment, l, r, t, b);
            }

            prev = current;
        }
    }

    terminateStroke(id) {
        delete this.openStrokes[id];
    }

    clearScreen() {
        this.strokeQuad.purge();
        this.strokeOrder.length = 0;
        this.greenScreen();
        // TODO: implement undo for clear
    }

    buildGreenScreen() {
        this.sheetCtx.clearRect(0, 0, this.width, this.height);
        this.sheetCtx.fillStyle = "#ccddcc";
        this.sheetCtx.rect(0, 0, this.width, this.height);
        this.sheetCtx.fill();

        this.sheetCtx.beginPath();
        this.sheetCtx.strokeStyle = "#99bbaa";
        this.sheetCtx.lineWidth = 1;
        for (let i=Browser.scale(50); i<this.width; i+=Browser.scale(50)) {
            this.sheetCtx.moveTo(i, 0);
            this.sheetCtx.lineTo(i, this.height);
        }
        for (let i=Browser.scale(50); i<this.height; i+=Browser.scale(50)) {
            this.sheetCtx.moveTo(0, i);
            this.sheetCtx.lineTo(this.width, i);
        }
        this.sheetCtx.stroke();
    }

    greenScreen() {
        this.bCtx.drawImage(this.sheet, 0, 0, this.width, this.height);
    }
}
