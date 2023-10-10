'use strict'

import { Browser } from "./Browser.js";
import { MouseInput } from "./MouseInput.js";
import * as Draw from "./Draw.js";
const touchEnabled = false;

export class PointerInput {
    constructor(bus, surface) {
        this.bus = bus;

        surface.addEventListener('pointerdown', start.bind(this));
        surface.addEventListener('pointermove', move.bind(this));
        surface.addEventListener('pointerup', stop.bind(this));

        // turn off context menues
        surface.addEventListener('contextmenu', (e) => e.preventDefault());

        // prevent touch scrolling
        surface.addEventListener('touchstart', (e) => e.preventDefault());
        surface.addEventListener('touchmove', (e) => e.preventDefault());
    }

    newInput(id, type, point, tilt, pressure) {
        let data = { id: id, type: type, point: point };

        if (tilt) { data.tilt = tilt }
        if (pressure) { data.pressure = pressure }

        this.bus.publish('input', 'newInput', data);
    }

    addInput(id, point, tilt, pressure) {
        let data = { id: id, point: point };

        if (tilt) { data.tilt = tilt }
        if (pressure) { data.pressure = pressure }

        this.bus.publish('input', 'addInput', data);
    }

    endInput(id) {
        this.bus.publish('input', 'endInput', { id: id });
    }
}

function transformXY (a, b) { return [b, Browser.height -  a]; }

function magicTrigger(x, y) {
    return x > 1450 && y > 900;
}

function getXY (e) {
    let [x, y] = [ e.clientX, e.clientY ];

    return Browser.rotated ? transformXY(x, y) : [x, y];
}

function start(e) {
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);

    let [x, y] = getXY(e);

    let point = [ Browser.scale(x), Browser.scale(y) ];
    let tilt = [ e.tiltX, e.tiltY ];
    if (e.pointerType=="pen") {
        let type = (tilt[0] || tilt[1]) ? "pen" : "eraser";
        this.newInput(e.pointerId, type, point, tilt);
    } else if (e.pointerType == "mouse") {
        // button 2 is the right click, button 4 is (?) the wheel
        let type = (e.buttons == 2) ? "eraser" : "pen";
        this.mouseInput = new MouseInput(type);
        this.newInput(this.mouseInput.id, type, point);
    } else if (e.pointerType === "touch") {
        // Send a single touch as a pointing event, (or handled downstream)

        if (magicTrigger(...point)) {
            console.log("MAGIC TIME");
        }

        // A single touch to the corner activates the eraser mode
        // The next single touch acts as a stroke eraser
        // the next touch make a double touch, hotwire eraser
        // the next touch is ignored for now, maybe polygone eraser?
    } else {
        console.log(e);
    }
}

function move(e) {
    // TODO: Do we want to turn off "touch" type inputs???
    //if (e.pointerType == "touch") { return };

    // TODO: Do we need this?
    if (typeof e === 'undefined') {
        this.bus.publish('debug', "error", "event is undefined, stopping it from adding");
        return;
    }

    e.preventDefault();

    let [x, y] = getXY(e);

    let point = [ Browser.scale(x), Browser.scale(y) ];
    let tilt = [e.tiltX, e.tiltY];
    if (e.pointerType == "pen") {
        this.addInput(e.pointerId, point, tilt);
    } else if (e.pointerType == "mouse" && this.mouseInput) {
        this.addInput(this.mouseInput.id, point, tilt);
    }
}

function stop(e) {
    e.preventDefault();

    let [x, y] = getXY(e);

    let point = [ Browser.scale(x), Browser.scale(y) ];
    let tilt = [e.tiltX, e.tiltY];
    if (e.pointerType == "mouse" && this.mouseInput) {
        this.addInput(this.mouseInput.id, point, tilt);
        this.endInput(this.mouseInput.id);

        this.mouseInput = undefined;
    } else if (e.pointerType=="pen") {
        if (buttons == "2") {
            return;
        }

        this.endInput(id);
    }
}
