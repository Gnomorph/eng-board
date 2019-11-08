import { Browser } from "./Browser.js";
import * as Radial from "./Radial.js";
const touchEnabled = false;

export class PointerInput {
    constructor(surface) {
        this.penId;
        this.surface = surface;

        surface.addEventListener('pointermove', this.pointHere.bind(this));
        surface.addEventListener('pointerdown', this.startPoint.bind(this));
        surface.addEventListener('pointerup', this.stopPoint.bind(this));
    }

    pointHere(e) {
        let n3 = [ Browser.resolution*e.clientX, Browser.resolution*e.clientY ];

        // Check the type reported by the browser for this event
        if (e.pointerType=="pen") {
            let tilt = [e.tiltX, e.tiltY];
            this.surface.logMove(e.pointerId, n3, e.pressure, tilt);

            if (e.buttons == "2") {
                // This is for "right click" or the surface pen button
                // OPEN the radial menu here
            } else if (e.buttons == "1") {
                this.surface.penDraw(e.pointerId, n3, e.pressure, e.tilt);
            }
        } else if (e.pointerType=="mouse") {
            this.surface.logMove(e.pointerId, n3);

            if (e.buttons == "1") {
                this.surface.mouseDraw(e.pointerId, n3);
            } else if (e.buttons == "4") {
                this.surface.erase(e.pointerId, n3);
            }
        } else if (this.penId == e.pointerId && e.pointerType == "touch") {
            // legacy/default pen support
        } else if (e.pointerType=="touch" && this.touchEnabled && e.buttons=="1") {
            // touch support
        }
    }

    startPoint(e) {
        let activeSubMenu = null;
        Radial.start(e, this.surface.pen);

        this.surface.logStart(
            [Browser.resolution*e.clientX, Browser.resolution*e.clientY]);
    }

    stopPoint(e) {
        // This should be handled by Radial somehow
        if (e.buttons == "2") {
            return;
        }

        let current = [Browser.resolution*e.clientX, Browser.resolution*e.clientY];
        if (e.mozInputSource == 2 && this.surface.pen.type=="pen" && this.surface.pen.tip=="pen") {
            Draw.line(this.surface.pen, this.surface.fCtx, this.surface.pen.history[3], current, 0, this.surface.pen.color, 10);
        }
    }
}
