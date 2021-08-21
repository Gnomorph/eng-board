import { DrawTip } from "./DrawTip.js";
import { Stroke } from "./Stroke.js";

// listen to input actions
// send out stroke actions
class StrokeMaker {
    width = 2;
    color = "black";
    actions = {
        "newInput": this.newInput.bind(this),
        "addInput": this.addInput.bind(this),
        "endInput": this.endInput.bind(this),
        "setTipColor": this.setTipColor.bind(this),
        "setTipWidth": this.setTipWidth.bind(this),
    };

    constructor(bus) {
        this.bus = bus;

        bus.subscribe('input', this.handleBusMessage.bind(this));
        bus.subscribe('pen', this.handleBusMessage.bind(this));
    }

    // Route the actions coming in from the message bus
    handleBusMessage(data) {
        if (data.action in this.actions) { this.actions[data.action](data); }
    }

    // Update the current color when a message is received.
    setTipColor(data) {
        console.log(data);
        this.color = data.value;
    }

    // Update the current width when a message is received.
    setTipWidth(data) {
        this.width = data.value;
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
        this.bus.publish("stroke", {action: "newStroke", stroke: stroke});
    }

    // Respond to a addInput action
    addInput(data) {
        // Pass the data along without modifying
        data.action = "addStroke";
        this.bus.publish("stroke", data);
    }

    // Respond to a endInput action
    endInput(data) {
        // Pass the data along without modifying
        data.action = "endStroke";
        this.bus.publish("stroke", data);
    }
}

export { StrokeMaker }
