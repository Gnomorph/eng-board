'use strict'

const SafariMatcher = /^((?!chrome|android).)*safari/i

class _Browser {
    _baseWidth = 1600;
    _baseHeight = 1050;

    constructor() { }

    get rotated() {
        // It turns out, we probably shouldn't forcibly rotate the screen.
        // We can use this as an entry point if we allow user rotation
        return false;
    }

    // Is the board limited by the "height" in the aspect ratio
    get shortLimited() {
        return this.trueHeight / this.trueWidth <= 16/10.5;
    }

    // Is the board limited by the "width" in the aspect ratio
    get longLimited() {
        return this.trueWidth / this.trueHeight <= 16/10.5;
    }

    get resolution() {
        return window.devicePixelRatio;
    }

    get trueWidth() {
        return (window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth);
    }

    get trueHeight() {
        return (window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight);
    }

    get width() {
        if (this.trueWidth === this.trueHeight) {
            return this.trueWidth;
        } else if (!this.rotated) { // Landscape
            if (this.longLimited) {
                return this.trueWidth;
            } else {
                return this.trueHeight*16/10.5;
            }
        } else { // Portrait
            if (this.shortLimited) {
                return this.trueHeight;
            } else {
                return this.trueWidth*10.5/16;
            }
        }
    }

    get height() {
        if (this.trueWidth === this.trueHeight) {
            return this.trueWidth;
        } else if (!this.rotated) { // Landscape
            if (this.longLimited) {
                return this.trueWidth*10.5/16;
            } else {
                return this.trueHeight;
            }
        } else { // Portrait
            if (this.shortLimited) {
                return this.trueHeight*10.5/16;
            } else {
                return this.trueWidth;
            }
        }
    }

    get isSafari() {
        return SafariMatcher.test(navigator.userAgent);
    }

    scale(value) {
        // only the limited edge can be used to scale correctly
        let factor = this.shortLimited ? 1600/this.width : 1050/this.height;
        return value * factor;
    }
}

let Browser = new _Browser();

export {
    Browser
}
