import { History } from "drawing-history";

// initially we will just have one global history.
// TODO: implement redis, and eventually pub/sub
let historyHash = {};

// parse list of static rooms from environment variable ROOMS
for (const room of JSON.parse(process.env.ROOMS)) {
    historyHash[room] = new History()
}

export default class RoomHistory {
    constructor(id, socket) {
        // the id is either an existing roomId, or the socket id
        this._id = id in historyHash ? id : socket.id;

        // if the room does not exist, then keep a local history
        this.history = id in historyHash ? historyHash[id] : new History();
    }

    get id() {
        return this._id;
    }

    // pickled - used during sync
    get pickled() {
        return this.history.pickled;
    }

    // TODO: we need a way to signal back that the message does not need to be
    // TODO: actually, I dont think that is correct.
    // broadcasted back to all other clients (i think)
    // log the messages into history;
    handleAction(action, data) {
        if (action === 'newStroke') {
            if (data._type !== 'pen') { return; }

            this.history.newStroke(data);
        } else if (action === 'addStroke') {
            if (!this.history.has(data.id)) { return; }

            let [x, y] = data.point;
            let [tiltX, tiltY] = data.tilt || [undefined, undefined];

            this.history.addStroke(data.id, x, y, tiltX, tiltY);
        } else if (action === 'endStroke') {
            if (!this.history.has(data.id)) { return; }
            this.history.endStroke(data.id);
        } else if (action === 'clear') {
            //this.history.add(msg);
            this.history.clearScreen();
        } else if (action === 'undo') {
            this.history.undo();
        } else if (action === 'redo') {
            this.history.redo();
        } else if (action === 'tryErase') {
            return;
        } else if (action === 'removeStroke') {
            this.history.remove(data);
        } else if (action === 'debug') {
            // catchall action for logging debug events
            console.log("debug");
        }
    }
}
