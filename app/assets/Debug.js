export class Debug {
    constructor(surface) {
    }
}

/*
let debugState = false;
let debugMenu = document.getElementById("debug-menu");

function init() {
    let oBrowser = document.getElementById('browser');
    oBrowser.innerHTML = isSafari ? "safari" : "firefox";

    let oWidth = document.getElementById('width');
    let oHeight = document.getElementById('height');
    oWidth.innerHTML = getWidth();
    oHeight.innerHTML = getHeight();
}

settingsButton.addEventListener('click', toggleDebug);

function toggleDebug(e) {
    if (debugState) {
        disableDebug();
    } else {
        enableDebug();
    }
}

function enableDebug() {
    debugState = true;
    debugMenu.style.display = "flex";
    bgBoard.addEventListener('pointermove', testMove);
    bgBoard.addEventListener('pointerdown', testDown);
    bgBoard.addEventListener('pointerup', testUp);
}

function disableDebug() {
    debugState = false;
    debugMenu.style.display = "none";
    bgBoard.removeEventListener('pointermove', testMove);
    bgBoard.removeEventListener('pointerdown', testDown);
    bgBoard.removeEventListener('pointerup', testUp);
}

function testMove(e) {
    let type = document.getElementById(e.pointerType + "-debug");

    type.querySelector('#x').innerHTML = resolution*e.clientX;
    type.querySelector('#y').innerHTML = resolution*e.clientY;
    type.querySelector('#buttons').innerHTML = e.buttons;
    type.querySelector('#pressure').innerHTML = e.pressure.toFixed(3);
    type.querySelector('#tiltx').innerHTML = e.tiltX;
    type.querySelector('#tilty').innerHTML = e.tiltY;
    type.querySelector('#id').innerHTML = e.pointerId;
}

function testUp(e) {
    let type = document.getElementById(e.pointerType + "-debug");

    type.querySelector('#state').innerHTML = "up";
}

function testDown(e) {
    let type = document.getElementById(e.pointerType + "-debug");

    type.querySelector('#state').innerHTML = "dn";
}
*/
