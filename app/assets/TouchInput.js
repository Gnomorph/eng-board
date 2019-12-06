import { Browser } from "./Browser.js";

const TOUCH_ACTIONS = ["touchstart", "touchmove", "touchend", "touchcancel"];

export class TouchInput {
    constructor(surface) {
        this.disableTouches(surface);

        let menu = document.getElementById("menu-container");

        if ('ontouchstart' in window) {
            let output = document.getElementById("debug-output");

            this.surface = surface;
            this.width = 25;
            this.height = 25;

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
                //e.originalTarget.focus();
                e.preventDefault()
            }, {passive: false});
        }
    }

    handleStart(e) {
        let pens = this.getPens(e.touches);
        let erasers = this.getErasers(e.touches);

        if (pens.length > 0) {
            let pen = pens[0];
            let pt = [
                //Browser.resolution*pen.clientX,
                //Browser.resolution*pen.clientY
                pen.clientX,
                pen.clientY
            ];

            this.surface.penStart(pen.identifier, "pen", ...pt);
        } else if (erasers.length > 0){
            for (let eraser of erasers) {
                let pt = [
                    //Browser.resolution*eraser.clientX,
                    //Browser.resolution*eraser.clientY
                    eraser.clientX,
                    eraser.clientY
                ];

                //this.surface.pen.erase(this.surface.fCtx, pt);
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
                //Browser.resolution*pen.clientX,
                //Browser.resolution*pen.clientY
                pen.clientX,
                pen.clientY
            ];

            this.surface.penMove(pen.identifier, ...pt);
        } else if (erasers.length > 0){
            for (let eraser of erasers) {
                let pt = [
                    //Browser.resolution*eraser.clientX,
                    //Browser.resolution*eraser.clientY
                    eraser.clientX,
                    eraser.clientY
                ];

                this.surface.penMove(eraser.identifier, ...pt);
            }
        }
    }

    handleEnd(e) {
        let pens = this.getPens(e.touches);
        let erasers = this.getErasers(e.touches);

        this.surface.penEnd(pen.identifier, ...pt);
        if (pens.length > 0) {
            let pen = pens[0];
            let pt = [
                //Browser.resolution*pen.clientX,
                //Browser.resolution*pen.clientY
                pen.clientX,
                pen.clientY
            ];

        } else if (erasers.length > 0){
            for (let eraser of erasers) {
                let pt = [
                    //Browser.resolution*eraser.clientX,
                    //Browser.resolution*eraser.clientY
                    eraser.clientX,
                    eraser.clientY
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
        let x = touch.clientX;
        let y = touch.clientY;
        //let x = Browser.resolution*touch.clientX;
        //let y = Browser.resolution*touch.clientY;
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
                //Browser.resolution*tp.clientX,
                //Browser.resolution*tp.clientY
                eraser.clientX,
                eraser.clientY
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
