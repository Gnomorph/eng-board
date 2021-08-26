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
        this.bus.subscribe("stroke", this.send.bind(this));
        this.bus.subscribe("timeline", this.send.bind(this));
    }

    send(action, data) {
        this.socket.emit("message", { action: action, data: data });
    }

    receive(msg) {
        //console.log(msg);
        if (msg.action === 'newStroke') {
            msg.data = StrokeFactory(msg.data);
            this.bus.publish('stroke', msg.action, msg.data);
        } else if (msg.action === 'addStroke' || msg.action === 'endStroke') {
            this.bus.publish('stroke', msg.action, msg.data);
        } else if (msg.action === 'tryErase') {
            msg.data = EraserStrokeFactory(msg.data);
            this.bus.publish('stroke', msg.action, msg.data);
        } else if (msg.action === 'clear') {
            this.bus.publish('stroke', msg.action);
        } else if (msg.action === 'undo' || msg.action === 'redo') {
            this.bus.publish('timeline', msg.action);
        } else {
            console.log(msg);
            return;
        }

    }
}
