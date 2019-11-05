let nw = document.getElementById('nw');
let ne = document.getElementById('ne');
let sw = document.getElementById('sw');
let se = document.getElementById('se');

function nwClick(e) { hide(); }
function swClick(e) { hide(); }
function neClick(e) { hide(); }
function seClick(e) { hide(); }

function draw(x, y) {
    nw.style.display = "initial";
    sw.style.display = "initial";
    ne.style.display = "initial";
    se.style.display = "initial";

    nw.style.left = (x - 144) + "px";
    ne.style.left = (x) + "px";
    sw.style.left = (x - 144) + "px";
    se.style.left = (x) + "px";

    nw.style.top = (y - 144) + "px";
    ne.style.top = (y - 144) + "px";
    sw.style.top = (y) + "px";
    se.style.top = (y) + "px";
}

function hide(x, y) {
    nw.style.display = "none";
    sw.style.display = "none";
    ne.style.display = "none";
    se.style.display = "none";
}

function start(e, pen, stylus) {
    if (e.pointerType == "mouse" && e.buttons == "2") {
        //e.preventDefault();
        draw(e.clientX, e.clientY);
    }

    if (e.buttons == "2") {
        pen.clearHistory();
        stylus.clearHistory();
        return;
    }
}
function init(foreground, background) {
    hide();
    nw.addEventListener("click", nwClick);
    ne.addEventListener("click", neClick);
    sw.addEventListener("click", swClick);
    se.addEventListener("click", seClick);
    // disable right click
    document.body.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });
}

export {
    init,
    start,
    hide,
    draw
}
