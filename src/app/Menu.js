export class Menu {
    constructor(bus) {
        this.bus = bus;

        this.setupButtons();
        this.setupSubMenus();

        this.setupPenWidth();
        this.setupPenColors();

        // Fullscreen change event action
        document.addEventListener(
            'fullscreenchange', this.fullscreenChanged.bind(this));
    }

    /******************
     * SETUP FUNCTIONS
     ******************/

    eraser() {
        // as the server to give you all of it's changes
        this.bus.publish("timeline", "pull");
    }

    pencil() {
        // ask the server to take all of your changes
        this.bus.publish("timeline", "requestPush");
    }

    setupButtons() {
        [
            ["pencil", this.pencil],
            ["eraser", this.eraser],
            ["fullscreen", this.fullscreen],
            ["trash", this.clearSurface],
            ["save", this.mysave],
            ["undo", this.undo],
            ["redo", this.redo],
        ].map(btn => {
            return { name: btn[0], callback: btn[1] }
        }).forEach(btn => {
            this.onHitByName(btn.name, btn.callback);
        })
    }

    setupSubMenus() {
        // Assign an action to deactivate sub menus on any interaction
        this.activeSubMenu = null;
        this.onHitElement(document.body, this.deactivateMenu);

        // Assign Sub Menus to their buttons
        for (let menu of menus) {
            this.onHitElement(menu[0], this.makeShowSubMenu(...menu));
        }

    }

    setupPenWidth() {
        let penWidthSlider = document.getElementById('pen-width-slider');
        penWidthSlider.addEventListener(
            'input', this.updateWidthDisplay.bind(this));
        penWidthSlider.addEventListener(
            'change', this.updatePenWidth.bind(this));
        penWidthSlider.value = 2;

        let penWidthValue = document.getElementById('pen-width-value');
        penWidthValue.innerHTML = 2;
    }

    setupPenColors() {
        let penColors = document.getElementById('color-container');
        colorList
            .map(color => {
                return {name: color[0], value: color[1] }
            }).map(color => {
                let colorBtn = makeColorButton(color.name, color.value)
                this.onHitElement(colorBtn, this.makeSetPenColor(x.color));
                return colorBtn;
            }).forEach(colorBtn => { penColors.appendChild(colorBtn) })
    }

    /*********************
     * UTILITY FUNCTIONS
     *********************/

    onHitByName(name, callback) {
        let element = document.getElementById(name);
        this.onHitElement(element, callback);
    }

    onHitElement(element, callback) {
        element.addEventListener('click', callback.bind(this), false);
        element.addEventListener('touchstart', callback.bind(this), false);
    }

    /***********************
     * Event Actions *
     ***********************/

    fullscreenChanged(e) {
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
        //this.bus.publish('events', 'resize');
    }

    /***********************
     * Menu Button Actions *
     ***********************/

    updateWidthDisplay(e) {
        let penWidthSlider = document.getElementById('pen-width-slider');
        let penWidthValue = document.getElementById('pen-width-value');
        penWidthValue.innerHTML = penWidthSlider.value;
    }

    updatePenWidth(e) {
        this.bus.publish('pen', 'setTipWidth', e.target.value);
    }

    makeSetPenColor(color) {
        return function(e) {
            this.bus.publish('pen', 'setTipColor',
                e.target.attributes.getNamedItem("title").nodeValue);
        }
    }

    clearSurface(e) {
        e.preventDefault();
        this.bus.publish('stroke', 'clear');
    }

    deactivateMenu(e) {
        if (!subMenuPattern.test(e.target.className) && this.activeSubMenu) {
            this.activeSubMenu.style.display = "none";
        }
    }

    undo(e) {
        e.preventDefault();
        this.bus.publish('timeline', 'undo');
    }

    redo(e) {
        e.preventDefault();
        this.bus.publish('timeline', 'redo');
    }

    mysave(e) {
        e.preventDefault();

        // TODO This is not working
        let canvas = document.getElementById("bg-board");
        let link = document.getElementById("dl-link");
        link.href = canvas.toDataURL('image/jpeg');
        //window.open(canvas.toDataURL('image/svg'), "_blank");
        //window.open(canvas.toDataURL('image/jpeg'), "_blank");

        this.bus.publish('events', 'saveSVG');
    }

    fullscreen(e) {
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
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
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

            this.activeSubMenu = menu;
            this.activeSubMenu.style.display = "flex";
            e.cancelBubble = true;
        }
    }
}

const subMenuPattern = /sub-menu/;

const colorList = [
    [ "black", "#000000"],
    [ "red", "#ff0000"],
    [ "maroon", "#800000"],
    [ "green", "#00a000"],
    [ "darkgreen", "#106010"],
    [ "blue", "#0000ff"],
    [ "darkblue", "#000080"],
    [ "purple", "#800080"],
    [ "violet", "#ee82ee"],
    [ "indigo", "#4b0082"],
    [ "yellow", "#d0d000"],
    [ "teal", "#008080"],
    [ "aqua", "#00cccc"],
    [ "brown", "#421010"],
    [ "grey", "#808080"],
];

const menus = [
    [ document.getElementById('pen'),
        document.getElementById('pen-submenu') ],
    //[ document.getElementById('pencil'),
        //document.getElementById('pencil-submenu') ],
    [ document.getElementById('highlighter'),
        document.getElementById('highlighter-submenu') ],
    //[ document.getElementById('eraser'),
        //document.getElementById('eraser-submenu') ],
];

function makeColorButton(name, value) {
    var colorBtn = document.createElement("div");
    colorBtn.id = `pen-${name}`;
    colorBtn.style.backgroundColor = value;
    colorBtn.title = name;
    colorBtn.style.width = "50px";
    colorBtn.style.height = "50px";

    return colorBtn;
}
