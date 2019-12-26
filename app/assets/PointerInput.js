'use strict'

import { Browser } from "./Browser.js";
import * as Draw from "./Draw.js";
import * as Radial from "./Radial.js";
const touchEnabled = false;

export class PointerInput {
    constructor(surface) {
        this.penId;
        this.surface = surface;

        surface.addEventListener('pointermove', this.pointHere.bind(this));
        surface.addEventListener('pointerdown', this.startPoint.bind(this));
        surface.addEventListener('pointerup', this.stopPoint.bind(this));
        surface.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    pointHere(e) {
        if (typeof e === 'undefined') {
            console.log("event is undefined, stopping it from adding");
            return;
        }

        //if (e.pointerType == "touch") { return };
        e.preventDefault();

        // Check the type reported by the browser for this event
        if (e.pointerType=="pen") {
            let tilt = [e.tiltX, e.tiltY];
            this.surface.penMove(e.pointerId,
                Browser.scale(e.clientX),
                Browser.scale(e.clientY)
            );

            if (e.buttons == "2") {
                // This is for "right click" or the surface pen button
                // OPEN the radial menu here
            } else if (e.buttons == "1") {
            }
        } else if (e.pointerType=="mouse") {
            this.surface.penMove(e.pointerId,
                Browser.scale(e.clientX),
                Browser.scale(e.clientY));
        } else if (this.penId == e.pointerId && e.pointerType == "touch") {
            // legacy/default pen support
        } else if (e.pointerType=="touch" && this.touchEnabled && e.buttons=="1") {
            // touch support
        }
    }

    startPoint(e) {
        e.preventDefault();
        if (e.pointerType=="pen") {
            //Radial.start(e, this.surface.pen);

            let type = (e.tiltX || e.tiltY) ? "pen" : "eraser";
            this.surface.penStart(e.pointerId, type,
                Browser.scale(e.clientX),
                Browser.scale(e.clientY),
                e.tiltX, e.tiltY);
        } else if (e.pointerType == "mouse") {
            //Radial.start(e, this.surface.pen);

            let type = (e.buttons == 2) ? "eraser" : "pen";
            //let type = (e.buttons == 4) ? "eraser" : "pen";
            this.surface.penStart(e.pointerId, type,
                Browser.scale(e.clientX),
                Browser.scale(e.clientY),
                e.tiltX, e.tiltY);
        }
    }

    stopPoint(e) {
        e.preventDefault();
        if (e.pointerType=="pen" || e.pointerType == "mouse") {
            // This should be handled by Radial somehow
            if (e.buttons == "2") {
                return;
            }

            this.surface.penEnd(e.pointerId,
                Browser.scale(e.clientX),
                Browser.scale(e.clientY));

            let current = [
                Browser.resolution*e.clientX,
                Browser.resolution*e.clientY,
            ];

            current = [
                Browser.scale(e.clientX),
                Browser.scale(e.clientY)
            ];
            //if (e.mozInputSource == 2 && this.surface.pen.type=="pen" && this.surface.pen.tip=="pen") {
                // TODO THIS LINE CAUSES THE STREAK ERROR
                //Draw.line(this.surface.pen, this.surface.fCtx,
                //    this.surface.pen.history[3], current, 0,
                //    this.surface.pen.color, 10);
            //}
        }
    }
}
