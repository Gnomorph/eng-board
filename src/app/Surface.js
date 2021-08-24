'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import * as Draw from "./Draw.js";
import { DrawTip } from "./DrawTip.js";

import { StrokePoint } from "./StrokePoint.js";
import { StrokeSegment } from "./StrokeSegment.js";

export class Surface {
    actions = {
        "drawStroke": this.drawStroke,
        "drawLine": this.drawLine,
        "drawPoint": this.drawPoint,
        "requestRedraw": this.requestRedraw,
    }

    get width() { return Browser.width; }
    get height() { return Browser.height; }

    constructor(bus, canvas) {
        this.bus = bus;

        // All of these commands come from the StateManager
        this.bus.subscribe('draw', this.handleBusMessage.bind(this));

        // History and Undo Setup
        this.eraserStrokeLast = [];

        // Canvas and Context Setup
        this.board = canvas;
        this.board.width = this.width;
        this.board.height = this.height;

        // Make Offscreen Canvases
        this.sheet = makeBoard(this.width, this.height);

        // Setup Each Context
        this.bCtx = getMinimalContext(this.board);
        this.sheetCtx = getMinimalContext(this.sheet);

        this.buildGreenScreen();

        this.clearScreen();

        window.addEventListener('resize', this.resize.bind(this), 100);
    }

    resize() {
        setTimeout(() => {
            this.board.width = this.width;
            this.board.height = this.height;

            this.sheet.width = this.width;
            this.sheet.height = this.height;

            this.buildGreenScreen();
            this.bus.publish('events', { action: 'resize' });
        }, 100);
    }

    /***************************
     * EVENT LISTENERS - These should go eventually
     ***************************/
    addEventListener(trigger, callback) {
        this.board.addEventListener(trigger, callback);
    }

    removeEventListener(trigger, callback) {
        this.board.removeEventListener(trigger, callback);
    }

    /***************************
     * Event Bus Listener and Functions
     ***************************/

    handleBusMessage(data) {
        let action = data.action;
        if (action in this.actions) {
            this.actions[action].call(this, data);
        }
    }

    drawLine(data) {
        let prev = data.stroke.current;
        let cur = data.stroke.previous;
        let width = data.stroke.tip.width;
        let color = data.stroke.tip.color;
        Draw.line(this.bCtx, prev.x, prev.y, cur.x, cur.y, width, color);
    }

    drawPoint(data) {
        let x = data.stroke.last.x;
        let y = data.stroke.last.y;
        let width = data.stroke.tip.width;
        let color = data.stroke.tip.color;

        Draw.dot(this.bCtx, x, y, width, color);
    }

    drawStroke(data) {
        let stroke = data.stroke;

        let color = stroke.tip.color || "black";
        let width = stroke.tip.width || 2;
        let last = null;
        for (let point of stroke) {
            if (last) {
                Draw.line(this.bCtx, last.x, last.y, point.x, point.y, width, color);
            }

            last = point;
        }
    }

    clearScreen() {
        this.greenScreen();
    }

    requestRedraw() {
        this.clearScreen();

        this.bus.publish('draw', { action: 'redraw' });
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
