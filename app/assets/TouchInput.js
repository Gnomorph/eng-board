import { Browser } from "./Browser.js";

export class TouchInput {
    constructor(surface) {
        if (true || 'ontouchstart' in window) {
            //console.log("we add the touch stuff");
            this.surface = surface;
            this.width = 25;
            this.height = 25;

            surface.addEventListener("touchstart", this.handleAll.bind(this), false);
            surface.addEventListener("touchend", this.handleAll.bind(this), false);
            surface.addEventListener("touchcancel", this.handleAll.bind(this), false);
            surface.addEventListener("touchmove", this.handleAll.bind(this), false);
        }
    }

    handleAll(e) {
        e.preventDefault();

        let pens = this.getPens(e.touches);
        let erasers = this.getErasers(e.touches);

        if (pens.length > 0) {
            let pen = pens[0];
            let pt = [ Browser.resolution*pen.clientX, Browser.resolution*pen.clientY ];
            //this.surface.pen.id = pen.identifier;
            //this.surface.pen.pressure = pen.force;
            this.surface.logMove(pen.identifier, pt, 1, [0.1, 0.1]);
            this.surface.mouseDraw(pen.identifier, pt);
        } else if (erasers.length > 0){
            for (let eraser of erasers) {
                let pt = [ Browser.resolution*eraser.clientX, Browser.resolution*eraser.clientY ];
                this.surface.pen.erase(this.surface.fCtx, pt);
            }
        }
    }


    getPens(touchList) {
        let i;
        let pens = [];
        for (i=0; i<touchList.length; i++) {
            let touch = touchList[i];
            if (!touch.id || touch.touchType == "stylus") {
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
        let x = Browser.resolution*touch.clientX;
        let y = Browser.resolution*touch.clientY;
        return (x > this.width - Browser.resolution*100) && (y > this.height - Browser.resolution*100);
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
            let t3 = [ Browser.resolution*tp.clientX, Browser.resolution*tp.clientY ];
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
