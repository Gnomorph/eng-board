'use strict'

import { Browser } from "./Browser.js";
import { MouseInput } from "./MouseInput.js";
import * as Draw from "./Draw.js";
const touchEnabled = false;

export class PointerInput {
    constructor(bus, surface) {
        this.bus = bus;
        this.penId; // TODO: remove, unused 

        surface.addEventListener('pointerdown', this.startPoint.bind(this));
        surface.addEventListener('pointermove', this.pointHere.bind(this));
        surface.addEventListener('pointerup', this.stopPoint.bind(this));

        // turn off context menues
        surface.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    startPoint(e) {
        e.preventDefault();
        if (e.pointerType=="pen") {
            let type = (e.tiltX || e.tiltY) ? "pen" : "eraser";

            let pt = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];
            let tilt = [ e.tiltX, e.tiltY ];

            /*this.surface.penStart(e.pointerId, type, ..point, ..tilt);*/
            this.bus.publish('draw', {
                type: 'newStroke',
                data: {id: e.pointerId, point: pt, tilt: tilt, tip: type },
            });
        } else if (e.pointerType == "mouse") {
            // button 2 is the right click, button 4 is the wheel???
            let type = (e.buttons == 2) ? "eraser" : "pen";

            this.mouseInput = new MouseInput(type);

            let pt = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];

            this.bus.publish('draw', {
                type: 'newStroke',
                data: this.mouseInput.pointData(...pt),
            });
        }
    }

    pointHere(e) {
        if (typeof e === 'undefined') {
            this.bus.publish('debug', "event is undefined, stopping it from adding");
            return;
        }

        e.preventDefault();

        // TODO: Do we want to turn off "touch" type inputs???
        //if (e.pointerType == "touch") { return };

        // Check the type reported by the browser for this event
        if (e.pointerType=="pen") {
            let pt = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];
            let tilt = [e.tiltX, e.tiltY];

            this.bus.publish('draw', {
                type: 'addStroke',
                data: {id: e.pointerId, point: pt, tilt: tilt, tip: 'pen' },
            });

            if (e.buttons == "2") {
                // This is for "right click" or the surface pen button
                // OPEN the radial menu here
            } else if (e.buttons == "1") {
            }
        } else if (e.pointerType=="mouse") {
            // We need to make sure we only send events if the mouse is down
            if (this.mouseInput) {
                let pt = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];
                this.bus.publish('draw', {
                    type: 'addStroke',
                    data: this.mouseInput.pointData(...pt),
                });
            }
        } else if (this.penId == e.pointerId && e.pointerType == "touch") {
            // TODO: remove, unused
            // legacy/default pen support
        } else if (e.pointerType=="touch" && this.touchEnabled && e.buttons=="1") {
            // touch support
        }
    }

    stopPoint(e) {
        e.preventDefault();
        if (e.pointerType == "mouse") {
            let pt = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];
            this.bus.publish('draw', {
                type: 'addStroke',
                data: this.mouseInput.pointData(...pt),
            });

            this.bus.publish('draw', {
                type: 'endStroke',
                data: this.mouseInput.pointData(...pt),
            });
            this.mouseInput = undefined;
        }

        if (e.pointerType=="pen") {
            if (e.buttons == "2") {
                return;
            }

            let pt = [ Browser.scale(e.clientX), Browser.scale(e.clientY) ];
            this.bus.publish('draw', {
                type: 'endStroke',
                data: {id: e.pointerId, point: pt },
            });
        }
    }
}
