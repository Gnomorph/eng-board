import { Browser } from "./Browser.js";
import { QuadTree } from "./QuadTree.js";
import { StrokeSegment } from "stroke";
import { SvgFactory } from "./SvgMaker.js";
import { History, MakeHash } from "stroke-history";

// The StateManager will manage the state of the overall application.
// It will be responsible for mediating messages from the network and
// locally created input. It will also manage the state of the surface
// by redrawing the history onto a clean board when necessary.
export class StateManager {
    history = new History();
    strokeQuad = new QuadTree(0, 2*Browser.width, 0, 2*Browser.height);

    actions = {
        "requestPush": this.requestPush,
        "push": this.push,

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

    requestPush(data) {
        this.bus.publish('timeline', 'push', this.history.pickled);
    }

    // replace our whole history with the given history
    push(msg) {
        this.history.unpickle(msg.hash, msg.data);
        this.rebuildStrokeQuad();
        this.bus.publish('draw', 'requestRedraw');
    }

    saveSVG() {
        var image = new Image();
        image.src = SvgFactory(this.history.readOnlyHistory);

        document.getElementById('dl-image').src = image.src;

        let dlLink = document.getElementById('dl-link');
        dlLink.href = image.src;
        dlLink.download = `wb-screenshot-${new Date()}.svg`;
    }

    constructor(bus) {
        document.debugHistory = this.history;
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
        this.history.liveStrokes.forEach(stroke => {
            this.bus.publish('draw', 'drawStroke', stroke);
        });
    }

    undo(data) {
        this.history.undo();
        this.rebuildStrokeQuad();
        this.bus.publish('draw', 'requestRedraw');
    }

    redo(data) {
        this.history.redo();
        this.bus.publish('draw', 'requestRedraw');
        this.rebuildStrokeQuad();
    }

    clearScreen(data) {
        this.history.clearScreen();
        this.rebuildStrokeQuad();
        this.bus.publish('draw', 'requestRedraw');
    }

    setTipWidth(data) {
        // add this action into the event list history
    }

    setTipColor(data) {
        // add this action into the event list history
    }

    drawStroke(data) {
        // this is a possible action to add
        // you may want to just draw a whole stroke at once
        // this could be used to undo a delete
        // or it could be used to redo an undo-ed stroke
    }

    // assume that all start points must have an origin x, y for the stoke
    newStroke(stroke) {
        if (stroke?.type == 'pen') {
            this.history.newStroke(stroke);

            this.bus.publish('draw', 'drawPoint', stroke);
        }
    }

    addStroke(data) {
        let [ x, y ] = data.point;
        let [ tiltX, tiltY ] = data.tilt || [undefined, undefined];

        let stroke;
        if (this.history.has(data.id)) {
            stroke = this.history.addStroke(data.id, x, y, tiltX, tiltY);
            this.bus.publish('draw', 'drawLine', stroke);
        }

    }

    // finalize the given stroke (remove it from openStrokes)
    endStroke(data) {
        let stroke;
        if (this.history.has(data.id)) {
            stroke = this.history.endStroke(data.id);
            this.addToQuadTree(stroke);
        }
    }

    findErasedStrokes(stroke) {
        let [x1, y1] = stroke.previous.point;
        let [x2, y2] = stroke.current.point;

        let strokeSegment = new StrokeSegment(null, [x1, y1], [x2, y2]);

        for (let item of this.strokeQuad.getRect(...strokeSegment)) {
            if (strokeSegment.intersects(item._data)) {
                this.bus.broadcast('stroke', 'removeStroke', item._data.stroke.id);
            }
        }
    }

    deleteStroke(id) {
        // add this action into the event list history
        this.history.remove(id)

        this.rebuildStrokeQuad();
        this.bus.publish('draw', 'requestRedraw');
    }

    rebuildStrokeQuad() {
        this.strokeQuad.purge();

        let strokes = this.history.liveStrokes
            .forEach(stroke => this.addToQuadTree(stroke));
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
