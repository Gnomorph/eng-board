'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import * as Draw from "./Draw.js";
import { DrawTip, StrokeSegment, StrokePoint } from "drawing-strokes";

export class Surface {
    actions = {
        "drawStroke": this.drawStroke,
        "drawLine": this.drawLine,
        "drawPoint": this.drawPoint,
        "requestRedraw": this.requestRedraw,
    }

    get trueWidth() { return 1600; }
    get trueHeight() { return 1050; }

    get width() { return Browser.rotated ? this.trueHeight : this.trueWidth; }
    get height() { return Browser.rotated ? this.trueWidth : this.trueHeight; }

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

        // Setup Each Context
        this.bCtx = getMinimalContext(this.board);

        this.transform();

        this.drawGreenScreen(this.bCtx);

        this.clearScreen();

        window.addEventListener('resize', this.resize.bind(this), 100);
    }

    scale(value) {
        return 1600/32
    }

    transform() {
        if (Browser.rotated) {
            this.bCtx.translate(Browser.scale(Browser.height), 0);
            this.bCtx.rotate(Math.PI/2);
        }
    }

    resize() {
        setTimeout(() => {
            this.board.width = this.width;
            this.board.height = this.height;

            this.transform();

            this.drawGreenScreen(this.bCtx);

            this.bus.publish('events', 'resize');
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

    handleBusMessage(action, data) {
        if (action in this.actions) {
            this.actions[action].call(this, data);
        }
    }

    drawLine(stroke) {
        let prev = stroke.current;
        let cur = stroke.previous;
        let width = stroke.tip.width;
        let color = stroke.tip.color;
        Draw.line(this.bCtx, prev.x, prev.y, cur.x, cur.y, width, color);
    }

    drawPoint(stroke) {
        let x = stroke.last.x;
        let y = stroke.last.y;
        let width = stroke.tip.width;
        let color = stroke.tip.color;

        Draw.dot(this.bCtx, x, y, width, color);
    }

    drawStroke(stroke) {
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
        this.drawGreenScreen(this.bCtx);
    }

    requestRedraw() {
        this.clearScreen();

        this.bus.publish('draw', 'redraw');
    }

    drawGreenScreen(ctx) {
        ctx.clearRect(0, 0, this.trueWidth, this.trueHeight);
        ctx.fillStyle = "#ccddcc";
        ctx.rect(0, 0, this.trueWidth, this.trueHeight);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = "#99bbaa";
        ctx.lineWidth = 1;

        for (let i=this.scale(50); i<this.trueWidth; i+=this.scale(50)) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.trueHeight);
        }

        for (let i=this.scale(50); i<this.trueHeight; i+=this.scale(50)) {
            ctx.moveTo(0, i);
            ctx.lineTo(this.trueWidth, i);
        }

        ctx.stroke();
    }
}

function getMinimalContext (canvas) {
    let ctx = canvas.getContext("2d", {desynchronized: true});
    ctx.imageSmoothingEnabled = false;
    return ctx;
}
