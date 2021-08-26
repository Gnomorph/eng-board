import { Browser } from "./Browser.js";
import { QuadTree } from "./QuadTree.js";
import { StrokeSegment } from "./StrokeSegment.js";

// The StateManager will manage the state of the overall application.
// It will be responsible for mediating messages from the network and
// locally created input. It will also manage the state of the surface
// by redrawing the history onto a clean board when necessary.
export class StateManager {
    clearStack = [];
    undoStack = [];
    strokeOrder = [];
    openStrokes = {};
    strokeQuad = new QuadTree(0, 2*Browser.width, 0, 2*Browser.height);

    actions = {
        "tryErase": this.findErasedStrokes,
        "removeStroke": this.deleteStroke,

        "setTipWidth": this.setTipWidth,
        "setTipColor": this.setTipColor,

        "clear": this.clearScreen,
        "newStroke": this.newStroke,
        "addStroke": this.addStroke,
        "endStroke": this.endStroke,

        "undo": this.undo,
        "redo": this.redo,

        "resize": this.resize,
        "redraw": this.redraw,
        "saveSVG": this.saveSVG,
    };

    saveSVG() {
        let svg = [];
        let header = "xmlns='http://www.w3.org/2000/svg'"
        let width = Browser.width
        let height = Browser.height

        svg.push(`<svg ${header} width="${width}" height="${height}">`);

        this.strokeOrder
            .filter(x => x.action==='stroke')
            .map(x => x.stroke)
            .forEach(stroke => {
            let pairs = stroke._path.reduce((a, c) => {
                a.push(`${c._x} ${c._y}`) 
                return a;
            }, []).join(', ')

            svg.push(`<polyline fill="none" stroke="${stroke.tip.color}"
                stroke-width="${stroke.tip.width}" points="${pairs}">
                </polyline>`);
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
        // listen to: pen, stroke, timeline
        this.bus = bus;

        this.bus.subscribe("pen", this.handleBusMessage.bind(this));
        this.bus.subscribe("stroke", this.handleBusMessage.bind(this));
        this.bus.subscribe("timeline", this.handleBusMessage.bind(this));
        this.bus.subscribe("events", this.handleBusMessage.bind(this));
        this.bus.subscribe("draw", this.handleBusMessage.bind(this));
    }

    handleBusMessage(action, data) {
        if (action in this.actions) {
            this.actions[action].call(this, data);
        }
    }

    resize() {
        this.bus.publish('draw', 'requestRedraw');
    }

    redraw() {
        this.strokeOrder
            .filter(action => action.action === 'stroke')
            .map(x => x.stroke)
            .filter(stroke => !(stroke._deleted))
            .forEach(stroke => {
                this.bus.publish('draw', 'drawStroke', stroke);
            });
    }

    // TODO: this needs to be more advanced
    undo(data) {
        // FROM SURFACE'S OLD LOGIC
        if (this.strokeOrder.length == 0 && this.clearStack.length > 0) {
            this.strokeOrder = this.clearStack.pop();
            this.undoStack.push({ action: "clear" });
        } else if (this.strokeOrder.length > 0) {
            let action = this.strokeOrder.pop();

            if (action.action === "delete") {
                action.stroke._deleted = false;
            }

            this.undoStack.push(action);
        }

        // TODO: We need to handle undelete
        // every undo should log an appropriate "reverse" action to be
        //   able to redo this action.
        // actually, every action itself may need to have some information
        //   about how to undo it: setTipWidth => what was the last width?

        this.rebuildStrokeQuad();
        this.bus.publish('draw', 'requestRedraw');
    }

    redo(data) {
        // shuttle the most recent future command onto the current stack
        // replay the reverse-reverse action for this command
        // this could get confusing, so be careful

        if (this.undoStack.length > 0) {
            let action = this.undoStack.pop();

            if (action?.action === 'clear') {
                // Handle a clear action redo
                this.clearStack.push(this.strokeOrder);
                this.strokeOrder = [];
            } else if (action?.action === 'delete') {
                // handle the delete action
                let stroke = action.stroke;

                stroke._deleted = true;
                this.strokeOrder.push(action);
            } else if (action?.action === 'stroke') {
                this.strokeOrder.push(action);
            } else {
                console.log("OOPS, we missed an action");
            }

            this.bus.publish('draw', 'requestRedraw');
            this.rebuildStrokeQuad();
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

        this.clearStack.push(this.strokeOrder);
        this.strokeOrder = [];

        this.rebuildStrokeQuad();
        this.bus.publish('draw', 'requestRedraw');
    }

    drawStroke(data) {
        // this is a possible action to add
        // you may want to just draw a whole stroke at once
        // this could be used to undo a delete
        // or it could be used to redo an undo-ed stroke
    }

    // assume that all start points must have an origin x, y for the stoke
    newStroke(stroke) {
        // Maybe you want to destory the undo stack early?
        //this.undoStack.length = 0;

        if (stroke?.type == 'pen') {
            // create an entry for this stroke in openStrokes
            this.openStrokes[stroke.id] = stroke;

            // we probably want to do this at the end?
            this.strokeOrder.push({ action: 'stroke', stroke: stroke});

            this.bus.publish('draw', 'drawPoint', stroke);
        }
    }

    addStroke(data) {
        if (data.id in this.openStrokes) {
            let stroke = this.openStrokes[data.id];

            // add a point into the stroke's list of points
            let [ x, y ] = data.point;
            let [ tiltX, tiltY ] = data.tilt || [undefined, undefined];
            stroke.addXY(x, y, tiltX, tiltY);

            // draw a stroke segment onto the surface
            //this.surface.drawLine(stroke);
            this.bus.publish('draw', 'drawLine', stroke);

            // optionally, add this segment into the quad tree (or all on end)
            // TODO: in order to make drawing fast, don't add.
        }
    }

    // add this action into the event list history
    // note: this action needs to be a full drawStroke
    // TODO: currently we do this when the stroke is created.

    // destroy any future stack
    // TODO: currently we do this when the stroke is created.

    // finalize the given stroke (remove it from openStrokes)
    endStroke(data) {
        if (data.id in this.openStrokes) {
            this.undoStack.length = 0;

            // add this stroke to the quadtree
            this.addToQuadTree(this.openStrokes[data.id]);

            delete  this.openStrokes[data.id];
        }
    }

    findErasedStrokes(stroke) {
        let [x1, y1] = stroke.previous.point;
        let [x2, y2] = stroke.current.point;

        let strokeSegment = new StrokeSegment(null, [x1, y1], [x2, y2]);

        for (let item of this.strokeQuad.getRect(...strokeSegment)) {
            if (strokeSegment.intersects(item._data)) {
                console.log("HELLO");
                this.bus.broadcast('draw', 'removeStroke', item._data.stroke);
                this.undoStack.length = 0;
            }
        }
    }

    // TODO: There is a problem here. We depended on object references to be
    // able to backtrack out and find the stroke. but over the network we will
    // have no such links. We must explicitly find the references
    deleteStroke(stroke) {
        console.log("deleting", stroke);
        stroke._deleted = true;

        // add this action into the event list history
        this.strokeOrder.push({ action: "delete", stroke: stroke });

        this.rebuildStrokeQuad();
        this.bus.publish('draw', 'requestRedraw');
    }

    rebuildStrokeQuad() {
        this.strokeQuad.purge();

        let strokes = this.strokeOrder
            .filter(x => x.action === 'stroke')
            .map(x => x.stroke)
            .forEach(stroke => {
                this.addToQuadTree(stroke);
            });
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
