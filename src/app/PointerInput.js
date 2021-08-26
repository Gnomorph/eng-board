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
    }

    newInput(id, type, point, tilt, pressure) {
        data = { id: id, type: type, point: point };

        if (tilt) { data.tilt = tilt }
        if (pressure) { data.pressure = pressure }

        this.bus.publish('input', 'newInput', data);
    }

    addInput(id, point, tilt, pressure) {
        data = { id: id, point: point };

        if (tilt) { data.tilt = tilt }
        if (pressure) { data.pressure = pressure }

        this.bus.publish('input', 'addInput', data);
    }

    endInput(id) {
        this.bus.publish('input', 'endInput', { id: id });
    }
}

function start(e) {
    e.preventDefault();

    let point = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];
    let tilt = [ e.tiltX, e.tiltY ];
    if (e.pointerType=="pen") {
        let type = (tilt[0] || tilt[1]) ? "pen" : "eraser";
        this.newInput(e.pointerId, type, point, tilt);
    } else if (e.pointerType == "mouse") {
        // button 2 is the right click, button 4 is (?) the wheel
        let type = (e.buttons == 2) ? "eraser" : "pen";
        this.mouseInput = new MouseInput(type);
        this.newInput(this.mouseInput.id, type, point);
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

    let point = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];
    let tilt = [e.tiltX, e.tiltY];
    if (e.pointerType == "pen") {
        this.addInput(e.pointerId, point, tilt);
    } else if (e.pointerType == "mouse" && this.mouseInput) {
        this.addInput(this.mouseInput.id, point, tilt);
    }
}

function stop(e) {
    e.preventDefault();

    let point = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];

    if (e.pointerType == "mouse" && this.mouseInput) {
        this.addInput(this.mouseInput.id, point);
        this.endInput(this.mouseInput.id, point);

        this.mouseInput = undefined;
    } else if (e.pointerType=="pen") {
        if (buttons == "2") {
            return;
        }

        this.endInput(id);
    }
}
