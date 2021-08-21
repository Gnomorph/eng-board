import { io } from "socket.io-client";

// The "draw" action is used on the network side to communicate with the server
// The "send" action is used to move message from bus to server
// The "recieve" action is used to distribute messages from the serve
class NetworkBridge {
    constructor(bus) {
        this.bus = bus;

        this.socket = io("localhost:3000");
        this.socket.on('draw', this.receive.bind(this));

        this.bus.subscribe("send", this.send.bind(this));

    }

    send(data) {
        this.socket.emit("draw", data);
    }

    receive(msg) {
        this.bus.publish("receive", msg);
    }
}

export {
    NetworkBridge
}
