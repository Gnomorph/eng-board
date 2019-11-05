import * as Bezier from "./Bezier.js";

export class Pointer {
    constructor(id, width, pressureThreashold, resolution) {
        this.resolution = resolution || 1;
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
        Bezier.draw(context, ...this.history, pressureWidth, this.color);
    }

    async drawPencil(context, point) {
        this.hasUpdates = true;

        this.pushHistory(point);

        let pressureWidth = this.pressure * this.width;
        context.globalAlpha = 0.8;
        Bezier.draw(context, ...this.history, pressureWidth, this.color);

    }

    async drawHighlighter(context, point) {
        this.hasUpdates = true;
        //console.log("drawing", this.type, this.tip);

        let d = 25*this.resolution;
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

        let d = 25*this.resolution;
        let x = point[0];
        let y = point[1];

        context.clearRect(x-d, y-d, 2*d, 2*d);
    }

}
