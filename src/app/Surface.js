'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import * as Draw from "./Draw.js";
import { DrawTip, StrokeSegment, StrokePoint } from "drawing-strokes";

export class Surface {
    actions = {
        "drawStroke": this.drawStroke,
        "drawLine": this.drawLine,
        "drawEnd": this.drawEnd,
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

        this.resize();

        this.clearScreen();

        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('orientationchange', this.resize.bind(this));
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
        const bgboard = document.getElementById("bg-board");
        if (Browser.longLimited) {
            bgboard.style.width = window.innerWidth + "px";
            bgboard.style.height = window.innerWidth*10.5/16 + "px";
        } else {
            bgboard.style.width = window.innerHeight*16/10.5 + "px";
            bgboard.style.height = window.innerHeight + "px";
        }

        this.drawGreenScreen(this.bCtx);

        this.bus.publish('events', 'resize');
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
        let width = stroke.tip.width;
        let color = stroke.tip.color;

        let l = stroke.length;
        if (l == 2) {
            let p = stroke.item(l-2);
            let c = stroke.item(l-1);
            let ax = (p.x+c.x)/2, ay = (p.y+c.y)/2;

            Draw.line(this.bCtx, p.x, p.y, ax, ay, width, color);
        } else {
            let p = stroke.item(l-3);
            let c = stroke.item(l-2);
            let q = stroke.item(l-1);
            let ax = (p.x+c.x)/2, ay = (p.y+c.y)/2;
            let bx = (c.x+q.x)/2, by = (c.y+q.y)/2;
            Draw.bline(this.bCtx, ax, ay, bx, by, c.x, c.y, width, color);
        }
    }

    drawEnd(stroke) {
        let width = stroke.tip.width;
        let color = stroke.tip.color;

        let l = stroke.length;
        if (l >= 2) {
            let c = stroke.item(l-2);
            let q = stroke.item(l-1);
            let ax = (c.x+q.x)/2, ay = (c.y+q.y)/2;

            Draw.line(this.bCtx, ax, ay, q.x, q.y, width, color);
        }
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

        const l = stroke.length
        if (l <= 0) {
            return;
        }

        if (l == 1) {
            this.drawPoint(stroke);
            return;
        }

        if (l == 2) {
            // draw a single line
            const p = stroke.item(0);
            const q = stroke.item(1);
            Draw.line(this.bCtx, p.x, p.y, q.x, q.y, width, color);
            return;
        }

        // if l == 2, then it this will draw two half lines
        if (l >= 2) {
            // draw the start line
            {
                const p = stroke.item(0);
                const q = stroke.item(1);
                const mx = (p.x + q.x) / 2;
                const my = (p.y + q.y) / 2;
                Draw.line(this.bCtx, p.x, p.y, mx, my, width, color);
            }

            // draw the start line
            {
                const p = stroke.item(l-2);
                const q = stroke.item(l-1);
                const mx = (p.x + q.x) / 2;
                const my = (p.y + q.y) / 2;
                Draw.line(this.bCtx, mx, my, q.x, q.y, width, color);
            }
        }

        // draw quadratics between each mid
        for (let i=1; i<l-1; ++i) {
            const c = stroke.item(i);
            const p = stroke.item(i-1);
            const q = stroke.item(i+1);

            const ax = (p.x + c.x) / 2;
            const ay = (p.y + c.y) / 2;

            const bx = (c.x + q.x) / 2;
            const by = (c.y + q.y) / 2;

            Draw.bline(this.bCtx, ax, ay, bx, by, c.x, c.y, width, color);
            //Draw.line(this.bCtx, ax, ay, bx, by, width, color);
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
