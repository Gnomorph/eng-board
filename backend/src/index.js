'use strict';

import http from 'http';
import express from 'express';

import SocketServer from './SocketServer.js';

// create the http and socket servers
const httpServer = http.createServer(express());
const socketServer = new SocketServer(httpServer);

// Set up the httpServer
httpServer.listen(process.env.PORT || 7000, '0.0.0.0', () => {
    console.log("Whiteboard Websocket listening: %s:%s",
                httpServer.address().address, httpServer.address().port);
});

// Handle exit signals
process.on('SIGTERM', process.exit);
process.on('SIGINT', process.exit);
