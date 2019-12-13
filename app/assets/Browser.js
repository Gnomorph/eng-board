'use strict'

const SafariMatcher = /^((?!chrome|android).)*safari/i

class _Browser {
    constructor() {
        this.resolution = window.devicePixelRatio;
    }

    get width() {
        return this.resolution * (window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth);
    }

    get height() {
        return this.resolution * (window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight);
    }

    get isSafari() {
        return SafariMatcher.test(navigator.userAgent);
    }
}

let Browser = new _Browser();
export {
    Browser
}
