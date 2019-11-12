'use strict'

import { Path } from "./Path.js";
import { Browser } from "./Browser.js";
import * as Draw from "./Draw.js";

export class Surface {
    constructor(canvas) {
        this.tip = null;
        //this.pen = new Pointer(null, 5, 0.25, Browser.resolution, "#000000");
        //this.stroke = new Path(null, 5, 0.25, Browser.resolution, "#000000");
        this.drawables = [];
        this.hasUpdates = false;

        this.bgBoard = canvas;
        this.fgBoard = document.getElementById("fg-board");
        this.bsBoard = document.getElementById("bs-board");

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
        vm.width  = Browser.width;
        vm.height = Browser.height;

        let minWidth = vm.width;
        minWidth = Math.max(minWidth, vm.width);
        minWidth = Math.max(minWidth, vm.width);
        minWidth = Math.max(minWidth, vm.width);

        let minHeight = vm.height;
        minHeight = Math.max(minHeight, vm.height);
        minHeight = Math.max(minHeight, vm.height);
        minHeight = Math.max(minHeight, vm.height);

        vm.hasUpdates = true;

        vm.sCtx.drawImage(vm.fgBoard, 0, 0);

        vm.bgBoard.width = vm.width;
        vm.bgBoard.height = vm.height;
        vm.bCtx.clearRect(0, 0, vm.width, vm.height);
        vm.bCtx.drawImage(vm.bsBoard, 0, 0);

        vm.fgBoard.width = minWidth;
        vm.fgBoard.height = minHeight;
        vm.fCtx.clearRect(0, 0, vm.width, vm.height);

        vm.fCtx.drawImage(vm.bsBoard, 0, 0);

        vm.bsBoard.width = minWidth;
        vm.bsBoard.height = minHeight;
        vm.sCtx.drawImage(vm.fgBoard, 0, 0);
        /*
            let oWidth = document.getElementById('width');
            let oHeight = document.getElementById('height');
            oWidth.innerHTML = getWidth();
            oHeight.innerHTML = getHeight();
            */
    }
}
