import { Browser } from "./Browser.js";
import { Stroke } from "./Stroke.js";
import { QuadTree } from "./QuadTree.js";
import { StrokeSegment } from "./StrokeSegment.js";

// The StateManager will manage the state of the overall application.
// It will be responsible for mediating messages from the network and
// locally created input. It will also manage the state of the surface
// by redrawing the history onto a clean board when necessary.
class StateManager {
    clearStack = [];
    undoStack = [];
    strokeOrder = [];
    openStrokes = {};
    strokeQuad = new QuadTree(0, 2*Browser.width, 0, 2*Browser.height);

    actions = {
        "setTipWidth": this.setTipWidth,
        "setTipColor": this.setTipColor,

        "clear": this.clearScreen,
        "newStroke": this.newStroke,
        "addStroke": this.addStroke,
        "endStroke": this.endStroke,

        "undo": this.undo,
        "redo": this.redo,

        "resize": this.redraw,
        "saveSVG": this.saveSVG,
    };

    saveSVG() {
        let svg = [];
        let header = "xmlns='http://www.w3.org/2000/svg'"
        let width = Browser.width
        let height = Browser.height

        svg.push(`<svg ${header} width="${width}" height="${height}">`);

        this.strokeOrder.forEach(stroke => {
            let pairs = stroke._path.reduce((a, c) => {
                a.push(`${c._x} ${c._y}`) 
                return a;
            }, []).join(', ')

            svg.push(`<polyline fill="none" stroke="${stroke.tip.color}" stroke-width="${stroke.tip.width}" points="${pairs}"></polyline>`);
        })
        svg.push("</svg>");
        svg = svg.join('');

        svg = `data:image/svg+xml,${svg}`;

        var image = new Image();
        image.src = svg;
        image.alt = "sample";

        //var w = window.open("", "_blank");
        //w.document.write(image.outerHTML);

        let dlLink = document.getElementById('dl-link');
        let dlImage = document.getElementById('dl-image');

        dlImage.src = image.src;
        dlLink.href = image.src;
        dlLink.download = `wb-screenshot-${new Date()}.svg`;
    }

    constructor(bus) {
        // listen to: pen, stroke, receive, timeline
        this.bus = bus;

        bus.subscribe("pen", this.handleBusMessage.bind(this));
        bus.subscribe("stroke", this.handleBusMessage.bind(this));
        bus.subscribe("receive", this.handleBusMessage.bind(this));
        bus.subscribe("timeline", this.handleBusMessage.bind(this));
        bus.subscribe("events", this.handleBusMessage.bind(this));
    }

    handleBusMessage(data) {
        let action = data.action;
        if (action in this.actions) {
            this.actions[action].call(this, data);
        }
    }

    // TODO: you need to purge the quadTree and rebuild it
    redraw() {
        this.bus.publish('draw', { action: 'clearScreen' });
        for (let stroke of this.strokeOrder) {
            if (!stroke.deleted) {
                this.bus.publish('draw', { action: 'drawStroke', stroke:stroke });
            }
        }
    }

    // actions
    // TODO: this needs to be more advanced
    undo(data) {
        // FROM SURFACE'S OLD LOGIC
        if (this.strokeOrder.length == 0 && this.clearStack.length > 0) {
            this.strokeOrder = this.clearStack.pop();
            this.undoStack.push("clear");
            this.redraw();
        } else if (this.strokeOrder.length > 0) {
            this.undoStack.push(this.strokeOrder.pop());
            this.redraw();
        }



        // shuttle the last command into a temporary future stack
        // clear the surface, then repeat all commands since the last clear

        // if there isn't an actions in the most recent commands
        // then pop a clear bundle from it's stack and unpack it
        // replay all commands onto the current screen
        // don't forget to log a clear action into the future stack

        // every undo should log an appropriate "reverse" action to be
        //   able to redo this action.
        // actually, every action itself may need to have some information
        //   about how to undo it: setTipWidth => what was the last width?
    }

    redo(data) {
        // shuttle the most recent future command onto the current stack
        // replay the reverse-reverse action for this command
        // this could get confusing, so be careful

        if (this.undoStack.length > 0) {
            let action = this.undoStack.pop();

            if (action === "clear") {
                // Handle a clear action redo
                this.clearStack.push(this.strokeOrder);
                this.strokeOrder = [];

                this.strokeQuad.purge();

                // tell the surface to clear it's contents
                this.bus.publish('draw', { action: 'clearScreen' });
            } else {
                this.strokeOrder.push(action);

                // TODO: you also probably need to add this to the quad tree
            }

            this.redraw();
        }
    }

    setTipWidth(data) {
        // add this action into the event list history
    }

    setTipColor(data) {
        // add this action into the event list history
    }

    clearScreen(data) {
        this.undoStack.length = 0;

        // store the list of strokes into a list of clears
        this.clearStack.push(this.strokeOrder);
        this.strokeOrder = [];

        this.strokeQuad.purge();

        // tell the surface to clear it's contents
        this.bus.publish('draw', { action: 'clearScreen' });
        console.log("clearScreen", this.clearStack);
    }

    deleteStroke(data) {
        // add this action into the event list history
    }

    drawStroke(data) {
        // this is a possible action to add
        // you may want to just draw a whole stroke at once
        // this could be used to undo a delete
        // or it could be used to redo an undo-ed stroke
    }

    // assume that all start points must have an origin x, y for the stoke
    newStroke(data) {
        // Maybe you want to destory the undo stack early?

        //this.undoStack.length = 0;

        let stroke = data.stroke;
        if (stroke instanceof Stroke) {
            // create an entry for this stroke in openStrokes
            this.openStrokes[stroke.id] = stroke;

            // we probably want to do this at the end?
            this.strokeOrder.push(stroke);

            //this.surface.drawPoint(stroke);
            this.bus.publish('draw', { action: 'drawPoint', stroke: stroke });
            //Draw.dot(this.bCtx, stroke.last.x, stroke.last.y, 2);
        }
    }

    addStroke(data) {
        let stroke = this.openStrokes[data.id];

        // add a point into the stroke's list of points
        let [ x, y ] = data.point;
        let [ tiltX, tiltY ] = data.tilt || [undefined, undefined];
        stroke.addXY(x, y, tiltX, tiltY);

        // draw a stroke segment onto the surface
        //this.surface.drawLine(stroke);
        this.bus.publish('draw', { action: 'drawLine', stroke: stroke });

        // optionally, add this segment into the quad tree (or all on end)
        // TODO: in order to make drawing fast, don't add.
    }

    // add this action into the event list history
    // note: this action needs to be a full drawStroke
    // TODO: currently we do this when the stroke is created.

    // destroy any future stack
    // TODO: currently we do this when the stroke is created.

    // finalize the given stroke (remove it from openStrokes)
    endStroke(data) {
        this.undoStack.length = 0;

        let stroke = this.openStrokes[data.id];

        // add this stroke to the quadtree
        this.addToQuadTree(stroke);

        delete  this.openStrokes[data.id];
    }

    addToQuadTree(stroke) {
        let prev;
        for (let current of stroke) {
            if (prev) {
                let l = Math.min(prev.x, current.x);
                let r = Math.max(prev.x, current.x);
                let t = Math.min(prev.y, current.y);
                let b = Math.max(prev.y, current.y);

                let p1 = [prev.x, prev.y];
                let p2 = [current.x, current.y];

                let segment = new StrokeSegment(stroke, p1, p2);
                this.strokeQuad.add(segment, l, r, t, b);
            }

            prev = current;
        }
    }

}

export { StateManager }
