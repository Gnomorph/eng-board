import { EraserStroke } from "./EraserStroke.js";
import { DrawTip } from "./DrawTip.js";
import { Stroke } from "./Stroke.js";

export class EraserManager {
    openErasers = {};

    constructor(bus) {
        this.bus = bus;

        bus.subscribe("stroke", makeHandler.call(this));
        bus.subscribe("draw", makeHandler.call(this));

    }

    redraw() {
        Object.keys(this.openErasers)
            .map(x => this.openErasers[x])
            .map(eraser => {
                let tip = new DrawTip('pen', 1, 'red');
                let stroke = new Stroke(eraser.id, 'pen', tip);
                stroke.addXY(eraser.previous[0], eraser.previous[1]);
                stroke.addXY(eraser.current[0], eraser.current[1]);

                return stroke;
            })
            .forEach(stroke => {
                this.bus.publish('draw', { action: 'drawStroke', stroke:stroke });
            });
    }

    newStroke(data) {
        if (data?.stroke?.type === 'eraser') {
            let stroke = data.stroke;

            let eraser = new EraserStroke(stroke.id, 'standard');
            eraser.addXY();
            this.openErasers[stroke.id] = eraser;
        }
    }

    addStroke(data) {
        if (data.id in this.openErasers) {
            let eraser = this.openErasers[data.id];
            eraser.add(data.point);

            this.bus.publish('draw', { action: 'requestRedraw' });
        }
    }

    endStroke(data) {
        if (data.id in this.openErasers) {
            delete  this.openErasers[data.id];
            this.bus.publish('draw', { action: 'requestRedraw' });
        }
    }

}

function makeHandler() {
    let actions = {
        "newStroke": this.newStroke.bind(this),
        "addStroke": this.addStroke.bind(this),
        "endStroke": this.endStroke.bind(this),

        "redraw": this.redraw.bind(this),
    };

    return function(data) {
        let action = data.action;

        if (action in actions) {
            return actions[action].call(this, data);
        }
    }
}
