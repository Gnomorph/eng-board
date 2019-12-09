import { Browser } from "./Browser.js";

export class Debug {
    constructor(surface) {
        this.debugOutput = document.getElementById("debug-output");
        window.onerror = this.globalErrorLog.bind(this);

        this.surface = surface;

        this.debugState = false;
        this.debugMenu = document.getElementById("debug-menu");

        this.oBrowser = document.getElementById('browser');
        this.oBrowser.innerHTML = Browser.isSafari ? "safari" : "firefox";

        this.oWidth = document.getElementById('width');
        this.oHeight = document.getElementById('height');
        this.oWidth.innerHTML = Browser.width;
        this.oHeight.innerHTML = Browser.height;

        this.settingsButton = document.getElementById("settings-button");
        this.settingsButton.addEventListener(
            'click', this.toggleDebug.bind(this));
        this.settingsButton.addEventListener(
            'touchstart', this.toggleDebug.bind(this));
    }

    log(...messages) {
        let output = document.createElement('div');
        output.innerHTML = messages.join(" ");

        this.debugOutput.appendChild(output);
        this.debugOutput.scrollTo(0, this.debugOutput.scrollHeight);
    }

    globalErrorLog(errorMsg, url, lineNumber) {
        // any action you want goes here
        // errorMsg is the error message itself.
        // url should be the file presenting the error, though i have
        //    found that it only presents to me the address of the site.
        // lineNumber is the line number the error occoured on.
        // here is an example of what you could do with it:
        this.log("Error in " + url + " at " + lineNumber + ":\n" + errorMsg);
    }

    toggleDebug(e) {
        e.preventDefault();
        if (this.debugState) {
            this.disableDebug();
        } else {
            this.enableDebug();
        }
    }

    enableDebug() {
        this.debugState = true;
        this.debugMenu.style.display = "flex";
        this.surface.bgBoard.addEventListener(
            'pointermove', this.testMove.bind(this));
        this.surface.bgBoard.addEventListener(
            'pointerdown', this.testDown.bind(this));
        this.surface.bgBoard.addEventListener(
            'pointerup', this.testUp.bind(this));

        if ('ontouchstart' in window) {
            this.surface.addEventListener(
                "touchstart", this.handleTouches.bind(this), false);
            this.surface.addEventListener(
                "touchend", this.handleTouches.bind(this), false);
            this.surface.addEventListener(
                "touchcancel", this.handleTouches.bind(this), false);
            this.surface.addEventListener(
                "touchmove", this.handleTouches.bind(this), false);
        }
    }

    handleTouches(e) {
        e.preventDefault();

        let touch = e.touches[0];

        if (touch) {
            //this.debugOutput.innerHTML = ("hello world 2");
            //this.debugOutput.innerHTML = JSON.stringify(JSON.parse(touch));
            //this.debugOutput.innerHTML = JSON.stringify(touch);
            //this.debugOutput.innerHTML = touch.touchType;
            //this.log(touch.touchType);

            //let type = document.getElementById(e.pointerType + "-debug");
            let type = document.getElementById("touch-debug");

            type.querySelector('#x').innerHTML =
                parseInt(Browser.resolution*touch.clientX);
            type.querySelector('#y').innerHTML =
                parseInt(Browser.resolution*touch.clientY);
            type.querySelector('#buttons').innerHTML = touch.rotationAngle;
            type.querySelector('#pressure').innerHTML = touch.force.toFixed(3);
            type.querySelector('#tiltx').innerHTML = touch.azimuthAngle.toFixed(3);
            type.querySelector('#tilty').innerHTML = touch.altitudeAngle.toFixed(3);
            type.querySelector('#id').innerHTML = touch.identifier;
        }
    }

    disableDebug() {
        this.debugState = false;
        this.debugMenu.style.display = "none";
        this.surface.bgBoard.removeEventListener(
            'pointermove', this.testMove.bind(this));
        this.surface.bgBoard.removeEventListener(
            'pointerdown', this.testDown.bind(this));
        this.surface.bgBoard.removeEventListener(
            'pointerup', this.testUp.bind(this));

        this.surface.removeEventListener(
            "touchstart", this.handleTouches.bind(this), false);
        this.surface.removeEventListener(
            "touchend", this.handleTouches.bind(this), false);
        this.surface.removeEventListener(
            "touchcancel", this.handleTouches.bind(this), false);
        this.surface.removeEventListener(
            "touchmove", this.handleTouches.bind(this), false);
    }

    testMove(e) {
        let type = document.getElementById(e.pointerType + "-debug");
        //document.debug.log("hi", e.clientX);

        type.querySelector('#x').innerHTML =
            parseInt(Browser.resolution*e.clientX);
        type.querySelector('#y').innerHTML =
            parseInt(Browser.resolution*e.clientY);
        type.querySelector('#buttons').innerHTML = e.buttons;
        type.querySelector('#pressure').innerHTML = e.pressure.toFixed(3);
        type.querySelector('#tiltx').innerHTML = e.tiltX;
        type.querySelector('#tilty').innerHTML = e.tiltY;
        type.querySelector('#id').innerHTML = e.pointerId;
    }

    testUp(e) {
        let type = document.getElementById(e.pointerType + "-debug");

        type.querySelector('#state').innerHTML = "up";
    }

    testDown(e) {
        let type = document.getElementById(e.pointerType + "-debug");

        type.querySelector('#state').innerHTML = "dn";
    }
}
