import { Browser } from "./Browser.js";

const TOUCH_ACTIONS = ["touchstart", "touchmove", "touchend", "touchcancel"];

export class TouchInput {
    constructor(surface) {
        this.disableTouches(surface);

        let menu = document.getElementById("menu-container");

        if ('ontouchstart' in window) {
            this.surface = surface;
            this.width = Browser.width;
            this.height = Browser.height;

            surface.addEventListener(
                "touchstart", this.handleStart.bind(this), false);
            surface.addEventListener(
                "touchend", this.handleEnd.bind(this), false);
            surface.addEventListener(
                "touchcancel", this.handleCancel.bind(this), false);
            surface.addEventListener(
                "touchmove", this.handleMove.bind(this), false);
        }
    }

    disableTouches(target) {
        for (let action of TOUCH_ACTIONS) {
            window.addEventListener(action, (e) => {
            //target.addEventListener(action, (e) => {
                //e.target.focus();
                e.preventDefault();
            }, {passive: false});

            document.getElementById("fullscreen").addEventListener(action, (e) => {
                e.target.focus();
            }, {passive: false});

        }
    }

    handleStart(e) {
        let pens = this.getPens(e.touches);
        let erasers = this.getErasers(e.touches);

        if (pens.length > 0) {
            let pen = pens[0];
            let pt = [
                Browser.scale(pen.clientX),
                Browser.scale(pen.clientY)
            ];

            this.surface.penStart(pen.identifier, "pen", ...pt);
        } else if (erasers.length > 0){
            for (let eraser of erasers) {
                let pt = [
                    Browser.scale(eraser.clientX),
                    Browser.scale(eraser.clientY)
                ];

                this.surface.penStart(eraser.identifier, "eraser", ...pt);
            }
        }
    }

    handleMove(e) {
        let pens = this.getPens(e.touches);
        let erasers = this.getErasers(e.touches);

        if (pens.length > 0) {
            let pen = pens[0];
            let pt = [
                Browser.scale(pen.clientX),
                Browser.scale(pen.clientY)
            ];

            this.surface.penMove(pen.identifier, ...pt);
        } else if (erasers.length > 0){
            for (let eraser of erasers) {
                let pt = [
                    Browser.scale(eraser.clientX),
                    Browser.scale(eraser.clientY)
                ];

                this.surface.penMove(eraser.identifier, ...pt);
            }
        }
    }

    handleEnd(e) {
        for (let touch of e.changedTouches) {
            let pt = [
                Browser.scale(touch.clientX),
                Browser.scale(touch.clientY)
            ];

            this.surface.penEnd(touch.identifier, ...pt);
        }

        return;

        let pens = this.getPens(e.touches);
        let erasers = this.getErasers(e.touches);

        this.surface.penEnd(pen.identifier, ...pt);
        if (pens.length > 0) {
            let pen = pens[0];
            let pt = [
                Browser.scale(pen.clientX),
                Browser.scale(pen.clientY)
            ];

        } else if (erasers.length > 0){
            for (let eraser of erasers) {
                let pt = [
                    Browser.scale(eraser.clientX),
                    Browser.scale(eraser.clientY)
                ];
                this.surface.penEnd(eraser.identifier, ...pt);
            }
        }
    }

    handleCancel(e) {
    }

    getPens(touchList) {
        let i;
        let pens = [];
        for (i=0; i<touchList.length; i++) {
            let touch = touchList[i];
            if (touch.touchType == "stylus") {
            //if (!touch.id || touch.touchType == "stylus") {
                return [touch];
            }
        }

        for (i=0; i<touchList.length; i++) {
            let touch = touchList[i];
            if (!touch.touchType || touch.touchType == "stylus") {
                pens.push(touch);
            }
        }

        return pens;
    }

    testEraser(touch) {
        let x = Browser.scale(touch.clientX);
        let y = Browser.scale(touch.clientY);

        return (x > this.width - Browser.resolution*100) &&
            (y > this.height - Browser.resolution*100);
    }

    getErasers(touchList) {
        let enabled = false;
        let erasers = [];

        let i;
        for (i=0; i<touchList.length; i++) {
            let touch = touchList[i];
            if (enabled) {
                erasers.push(touch);
            }
            enabled = enabled || this.testEraser(touch);
        }

        return erasers;
    }

    touchHere(tp) {
        if (tp.touchType=="stylus") {
            let t3 = [
                Browser.scale(eraser.clientX),
                Browser.scale(eraser.clientY)
            ];
            this.surface.pen.id = tp.identifier;
            this.surface.pen.type = "pen";
            this.surface.pen.tip = "pen";

            this.surface.pen.pressure = tp.force;
            // TODO fix width
            this.surface.pen.draw(fCtx, t3, 5);
        } else if (tp.touchType=="touch" && touchEnabled) {
            // touch support
        }
    }
}
