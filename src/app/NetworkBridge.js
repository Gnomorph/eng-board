import { io } from "socket.io-client";
import { StrokeFactory } from "./Stroke.js";
import { EraserStrokeFactory } from "./EraserStroke.js";

// The "draw" action is used on the network side to communicate with the server
// The "send" action is used to move message from bus to server
// The "recieve" action is used to distribute messages from the serve
export class NetworkBridge {
    constructor(bus) {
        this.bus = bus;

        this.socket = io("localhost:3000");

        // incoming packets from the network
        this.socket.on('message', this.receive.bind(this));

        // internal packets destined for the network
        //this.bus.subscribe("draw", this.send.bind(this));
        this.bus.subscribe("stroke", this.send.bind(this));
        this.bus.subscribe("timeline", this.send.bind(this));
    }

    send(data) {
        this.socket.emit("message", data);
    }

    receive(msg) {
        //console.log(msg);
        if (msg.action === 'newStroke') {
            msg.stroke = StrokeFactory(msg.stroke);
            this.bus.publish("stroke", msg);
        } else if (msg.action === 'addStroke') {
            this.bus.publish("stroke", msg);
        } else if (msg.action === 'endStroke') {
            this.bus.publish("stroke", msg);
        } else if (msg.action === 'tryErase') {
            //console.log(msg);
            msg.stroke = EraserStrokeFactory(msg.stroke);
            this.bus.publish("stroke", msg);
        } else if (msg.action === 'clear') {
            this.bus.publish("stroke", msg);
        } else if (msg.action === 'undo') {
            this.bus.publish("timeline", msg);
        } else if (msg.action === 'redo') {
            this.bus.publish("timeline", msg);
        } else {
            console.log(msg);
            return;
        }

    }
}
