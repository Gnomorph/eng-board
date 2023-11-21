import * as socketio from "socket.io";

import RoomHistory from "./RoomHistory.js";

function makeClient(socket) {
    let id = Math.floor(Math.random()*2147483647);
    let room;

    // Message Action Handler
    // process and store the action
    // then send the message out to all other clients in the room
    let message = function(msg) {
        room.handleAction(msg.action, msg.data);
        socket.to(room.id).emit('message', msg);
    }

    // History Sync Handler
    // push: do nothing currently, TODO design a sync logic
    // pull: pickle the current history, and send back to the client
    let sync = function(msg) {
        if (msg.action === 'push') {
        } else if (msg.action === 'pull') {
            socket.send({ action: 'push', data: room.pickled });
        }
    }

    return function subscribe(rm) {
        room = new RoomHistory(rm, socket);

        // once we are subscribed, join the room and listen for messages
        socket.join(room.id);
        socket.on('message', message.bind(this));
        socket.on('sync', sync.bind(this));

        sync({ action: 'pull' });
    }
}

export default class SocketServer {
    constructor(httpServer) {
        const socketOptions = { transports: ["websocket"] };
        const io = new socketio.Server(httpServer, socketOptions);

        io.on('connection', (socket) => {
            socket.on('subscribe', makeClient(socket));
        });
    }
}
