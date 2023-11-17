import { Stroke, DrawTip } from "drawing-strokes";

/**
 *  The purpose of the StrokeMaker module is to manage the state of the software
 *  defined drawing tool. It collects changes to width and color, and injects
 *  them into a stroke which is passed along on the bus
 *
 *  currently it creates a stroke object on each new input, but this might be
 *  contributing to a bit too much coupling with downstream modules
 *
 *  TODO: possibly move the "stroke" logic downstream, and just send raw
 *        id, width, color, xy, and tilt
 **/

// listen to input actions
// send out stroke actions
class StrokeMaker {
    width = 2;
    color = "black";
    actions = {
        "newInput": this.newInput,
        "addInput": this.addInput,
        "endInput": this.endInput,

        "setTipColor": this.setTipColor,
        "setTipWidth": this.setTipWidth,
    };

    constructor(bus) {
        this.bus = bus;

        // this picks up standardized input movement of the drawing tool
        this.bus.subscribe('input', this.handleBusMessage.bind(this));

        // this picks up changes in the pen type (color, width)
        this.bus.subscribe('pen', this.handleBusMessage.bind(this));
    }

    // Route the actions coming in from the message bus
    handleBusMessage(action, data) {
        if (action in this.actions) {
            this.actions[action].call(this, data);
        }
    }

    // Update the current color when a message is received.
    setTipColor(value) {
        this.color = value;
    }

    // Update the current width when a message is received.
    setTipWidth(value) {
        this.width = value;
    }

    // Respond to a newInput action
    newInput(data) {
        // Add Pen Tip parameters
        let tip = new DrawTip(data.type, this.width, this.color);
        let stroke = new Stroke(data.id, data.type, tip);

        let [ x, y ] = data.point;
        let [ tiltX, tiltY ] = data.tilt || [undefined, undefined];

        stroke.addXY(x, y, tiltX, tiltY);

        // then pass along
        this.bus.publish('stroke', "newStroke", stroke);
    }

    // Respond to a addInput action
    addInput(data) {
        // Pass the data along without modifying
        this.bus.publish('stroke', 'addStroke', data);
    }

    // Respond to a endInput action
    endInput(data) {
        // Pass the data along without modifying
        this.bus.publish('stroke', 'endStroke', data);
    }
}

export { StrokeMaker }
