const subMenuPattern = /sub-menu/;
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

export class Menu {
    updateWidthDisplay(e) {
        this.penWidthOut.innerHTML = this.penWidth.value;
    }

    updatePenWidth(e) {
        this.surface.tip.width = this.penWidth.value;
    }

    makeSetPenColor(color) {
        return function(e) {
            this.surface.pen.color = color;
        }
    }

    constructor(surface) {
        this.surface = surface;

        this.penColors = document.getElementById('color-container');
        this.penWidth = document.getElementById('pen-width-slider');
        this.penWidthOut = document.getElementById('pen-width-value');

        this.penWidth.addEventListener(
            'input', this.updateWidthDisplay.bind(this));

        this.penWidth.addEventListener(
            'change', this.updatePenWidth.bind(this));

        this.penWidthOut.innerHTML = 5;
        this.penWidth.value = 5;

        for (let color of colorList) {
            var colorButton = document.createElement("div");
            colorButton.id = "pen-" + color[0];
            colorButton.style.backgroundColor = color[1];
            colorButton.title = color[0];
            colorButton.style.width = "50px";
            colorButton.style.height = "50px";

            colorButton.addEventListener(
                'touchstart', this.makeSetPenColor(color[1]).bind(this));
            colorButton.addEventListener(
                'click', this.makeSetPenColor(color[1]).bind(this));

            this.penColors.appendChild(colorButton);
        }

        this.activeSubMenu = null;
        document.body.addEventListener(
            'touchstart', this.deactivateMenu.bind(this));
        document.body.addEventListener(
            'click', this.deactivateMenu.bind(this));

        document.getElementById("save").addEventListener(
            'touchstart', this.mySave.bind(this));
        document.getElementById("save").addEventListener(
            'click', this.mySave.bind(this));
        document.getElementById("fullscreen").addEventListener(
            'touchstart', this.myFullscreen.bind(this));
        document.getElementById("fullscreen").addEventListener(
            'click', this.myFullscreen.bind(this));
        document.getElementById("undo").addEventListener(
            'touchstart', this.myUndo.bind(this));
        document.getElementById("undo").addEventListener(
            'click', this.myUndo.bind(this));
        document.getElementById("redo").addEventListener(
            'touchstart', this.myRedo.bind(this));
        document.getElementById("redo").addEventListener(
            'click', this.myRedo.bind(this));

        for (let menu of menuMap) {
            menu[0].addEventListener(
                'touchstart', this.makeShowSubMenu(...menu).bind(this));
            menu[0].addEventListener(
                'click', this.makeShowSubMenu(...menu).bind(this));
        }

        document.getElementById('trash').addEventListener('touchstart',
            this.clearSurface.bind(this), false);
        document.getElementById('trash').addEventListener('click',
            this.clearSurface.bind(this), false);

        document.addEventListener('fullscreenchange', (event) => {
            // document.fullscreenElement will point to the element that
            // is in fullscreen mode if there is one. If there isn't one,
            // the value of the property is null.
            if (document.fullscreenElement) {
                document.getElementById("expand").style.display = "none";
                document.getElementById("compress").style.display = "initial";
            } else {
                document.getElementById("expand").style.display = "initial";
                document.getElementById("compress").style.display = "none";
            }

            // TODO call resize
        });

    }

    clearSurface(e) {
        e.preventDefault();
        this.surface.clearScreen();
    }

    deactivateMenu(e) {
        if (!subMenuPattern.test(e.target.className) && this.activeSubMenu) {
            this.activeSubMenu.style.display = "none";
        }
    }

    myUndo(e) {
        e.preventDefault();
        if (this.surface.strokeOrder.length > 0) {
            //this.surface.hasUpdates = true;
            this.surface.undoStack.push(this.surface.strokeOrder.pop());
            this.surface.update();
        }
    }

    myRedo(e) {
        e.preventDefault();
        if (this.surface.undoStack.length > 0) {
            //this.surface.hasUpdates = true;
            this.surface.strokeOrder.push(this.surface.undoStack.pop());
            this.surface.update();
        }
    }

    mySave(e) {
        e.preventDefault();
        // TODO
    }

    myFullscreen(e) {
        e.preventDefault();
        //var btn = document.getElementById("fullscreen");
        //btn.focus();
        //var elem = document.getElementById("bg-board");
        //elem.focus();
        let elem = document.body;

        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        } else {
            /* Close fullscreen */
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }

        }
    }

    makeShowSubMenu(tip, menu) {
        return function(e) {
            e.preventDefault();
            if (this.activeSubMenu) {
                this.activeSubMenu.style.display = "none";
            }

            this.surface.pen.tip = tip.id;
            this.activeSubMenu = menu;
            this.activeSubMenu.style.display = "flex";
            e.cancelBubble = true;
        }
    }
}
