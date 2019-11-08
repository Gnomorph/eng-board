export class Menu {
}

/*
const colorList = [
    [ "black", "#000000"],
    [ "red", "#ff0000"],
    [ "maroon", "#800000"],
    [ "green", "#00a000"],
    [ "darkgreen", "#106010"],
    [ "blue", "#0000ff"],
    [ "deepblue", "#000080"],
    [ "purple", "#800080"],
    [ "violet", "#ee82ee"],
    [ "indigo", "#4b0082"],
    [ "yellow", "#d0d000"],
    [ "aqua", "#008080"],
    [ "teal", "#00cccc"],
    [ "brown", "#421010"],
    [ "grey", "#808080"],
];

var settingsButton = document.getElementById("settings-button");

function init() {
    let penColors = document.getElementById('color-container');
    let penWidth = document.getElementById('pen-width-slider');
    let penWidthOut = document.getElementById('pen-width-value');

    penWidth.addEventListener('input', function(e) {
        penWidthOut.innerHTML = penWidth.value;
    });

    penWidth.addEventListener('change', function(e) {
        pen.width = penWidth.value;
        stylus.width = penWidth.value;
    });

    penWidthOut.innerHTML = 5;
    penWidth.value = 5;

    for (let color of colorList) {
        var colorButton = document.createElement("div");
        colorButton.id = "pen-" + color[0];
        colorButton.style.backgroundColor = color[1];
        colorButton.title = color[0];
        colorButton.style.width = "50px";
        colorButton.style.height = "50px";

        colorButton.addEventListener('click', function(e) {
            pen.color = color[1];
            stylus.color = color[1];
        });

        penColors.appendChild(colorButton);
    }
}

document.body.addEventListener('click', bodyClick);
const subMenuPattern = /sub-menu/;
let activeSubMenu = null;
function bodyClick(e) {
    if (!subMenuPattern.test(e.target.className) && activeSubMenu) {
        activeSubMenu.style.display = "none";
    }
}

function makeShowSubMenu(tip, menu) {
    return function(e) {
        if (activeSubMenu) {
            activeSubMenu.style.display = "none";
        }

        pen.tip = tip.id;
        activeSubMenu = menu;
        activeSubMenu.style.display = "flex";
        e.cancelBubble = true;
    }
}

const menuMap = [
    [ document.getElementById('pen'),
        document.getElementById('pen-submenu') ],
    [ document.getElementById('pencil'),
        document.getElementById('pencil-submenu') ],
    [ document.getElementById('highlighter'),
        document.getElementById('highlighter-submenu') ],
    [ document.getElementById('eraser'),
        document.getElementById('eraser-submenu') ],
];

for (let map of menuMap) {
    map[0].addEventListener('click', makeShowSubMenu(...map));
}
document.getElementById("save").addEventListener('click', myFullscreen);
function myFullscreen(e) {
    var elem = document.getElementById("bg-board");
    elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

document.getElementById('trash').addEventListener('click', clearScreen, false);
*/
