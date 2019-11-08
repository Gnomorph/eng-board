export class TouchInput {
    constructor(surface) {
        if ('ontouchstart' in window) {
            surface.addEventListener("touchstart", handleAll, false);
            surface.addEventListener("touchend", handleAll, false);
            surface.addEventListener("touchcancel", handleAll, false);
            surface.addEventListener("touchmove", handleAll, false);
        }
    }
}

/*
function getPens(touchList) {
    let i;
    let pens = [];
    for (i=0; i<touchList.length; i++) {
        let touch = touchList[i];
        if (touch.touchType == "stylus") {
            pens.push(touch);
        }
    }

    //return i;
    return pens;
}

function testEraser(touch) {
    let x = resolution*touch.clientX;
    let y = resolution*touch.clientY;
    return (x > width-resolution*100) && (y > height-resolution*100);
}

function getErasers(touchList) {
    let enabled = false;
    let erasers = [];

    let i;
    for (i=0; i<touchList.length; i++) {
        let touch = touchList[i];
        if (enabled) {
            erasers.push(touch);
        }
        enabled = enabled || testEraser(touch);
    }

    return erasers;
}

function handleAll(e) {
    e.preventDefault();

    let pens = getPens(e.touches);
    let erasers = getErasers(e.touches);

    if (pens.length > 0) {
        let pen = pens[0];
        let pt = [ resolution*pen.clientX, resolution*pen.clientY ];
        stylus.id = pen.identifier;
        stylus.pressure = pen.force;
        stylus.draw(fCtx, pt);
    } else if (erasers.length > 0){
        for (let eraser of erasers) {
            let pt = [ resolution*eraser.clientX, resolution*eraser.clientY ];
            stylus.erase(fCtx, pt);
        }
    }
}

function touchHere(tp) {
    if (tp.touchType=="stylus") {
        let t3 = [ resolution*tp.clientX, resolution*tp.clientY ];
        stylus.id = tp.identifier;
        stylus.type = "pen";
        stylus.tip = "pen";

        stylus.pressure = tp.force;
        stylus.draw(fCtx, t3);
    } else if (tp.touchType=="touch" && touchEnabled) {
        // touch support
    }
}
*/
