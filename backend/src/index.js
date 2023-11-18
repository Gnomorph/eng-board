'use strict';

import http from 'http';
import express from 'express';

import { History } from "drawing-history";

function cleanUp() {
    console.log('shutting down...');
    process.exit()
}

process.on('SIGTERM', cleanUp);
process.on('SIGINT', cleanUp);

const app = express();
const server = http.createServer(app);

import * as socketio from "socket.io";
const io = new socketio.Server(server, {
    transports: ['websocket'],
    cors: {
        origin: process.env.HTTP_HOST,
        methods: ["GET", "POST"],
    }
});

// initially we will just have one global history.
// TODO: implement redis, and eventually pub/sub
let historyHash = {};

// parse list of static rooms from environment variable ROOMS
for (const room of JSON.parse(process.env.ROOMS)) {
    historyHash[room] = new History()
}

io.on('connection', (socket) => {
    let client = makeClient(socket);

    socket.on('subscribe', client.subscribe);
});

server.listen(process.env.PORT || 7000, '0.0.0.0', () => {
    let host = server.address().address;
    let port = server.address().port;

    console.log("Whiteboard Websocket listening: http://%s:%s", host, port);
});

function makeClient(socket) {
    let id = Math.floor(Math.random()*2147483647);
    let history;
    let room;
    let socketId = socket.id;

    let message = function(msg) {
        // log the messages into history;
        if (msg.action === 'fullStroke') {
            // this action is no longer used
        } else if (msg.action === 'newStroke') {
            if (msg.data._type !== 'pen') { return; }

            history.newStroke(msg.data);
        } else if (msg.action === 'addStroke') {
            if (!history.has(msg.data.id)) { return; }

            let [x, y] = msg.data.point;
            let [tiltX, tiltY] = msg.data.tilt || [undefined, undefined];

            history.addStroke(msg.data.id, x, y, tiltX, tiltY);
        } else if (msg.action === 'endStroke') {
            if (!history.has(msg.data.id)) { return; }
            history.endStroke(msg.data.id);
        } else if (msg.action === 'clear') {
            //history.add(msg);
            history.clearScreen();
        } else if (msg.action === 'undo') {
            history.undo();
        } else if (msg.action === 'redo') {
            history.redo();
        } else if (msg.action === 'tryErase') {
            return;
        } else if (msg.action === 'removeStroke') {
            history.remove(msg.data);
        } else if (msg.action === 'debug') {
            // catchall action for logging debug events
            console.log("debug");
        }

        // Debug for tracking room messages
        socket.to(room).emit('message', msg);
    }

    let sync = function(msg) {
        if (msg.action === 'push') {
            // sync push actions can be ignored for now
            // TODO: design a real sync logic and workflow
        } else if (msg.action === 'pull') {
            // if a sync pull is requested, then push the history
            socket.send({ action: 'push', data: history.pickled });
        }
    }

    let subscribe = function(rm) {
        room = rm in historyHash ? rm : socket.id;
        history = rm in historyHash ? historyHash[rm] : new History();

        socket.join(room);
        socket.on('message', message.bind(this));
        socket.on('sync', sync.bind(this));

        sync({ action: 'pull' });
    }

    return {
        subscribe: subscribe,
        message: message,
        sync: sync,
    }
}
