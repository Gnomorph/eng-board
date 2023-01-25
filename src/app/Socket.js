export { Socket }

function makeEvents() {
    let events = new Map();
    events.set('connect', []);
    events.set('message', []);

    return events;
}

class Socket {
    events = makeEvents();

    actions = new Set([ 'subscribe', 'sync', 'message' ]);

    constructor(host) {
        this.host = host;

        // connect to the host
        this.connect();
    }

    on(evt, callback) {
        // register an event callback
        let item = this.events.get(evt);
        if (item) {
            item.push(callback);
        }
    }

    emit(action, data) {
        console.log("emit", 1);
        this._ws.send("hi");
        console.log("emit", 2);

        if (this.actions.has(action)) {
            this._ws.send(JSON.stringify({
                'action': action,
                'data': data,
            }));
        }
    }

    connect() {
        console.log(this.host);
        this._ws = new WebSocket(this.host);
        this._ws.onopen = function() {
            console.log('Open');
            let callbacks = this.events.get('connect');
            if (callbacks) {
                callbacks.forEach(cb => cb());
            }
        };

        this._ws.onmessage = function(e) {
            console.log('Message:', e.data);
            let callbacks = this.events.get('message');
            if (callbacks) {
                callbacks.forEach(cb => cb());
            }
        };

        this._ws.onclose = function(e) {
            console.log('Socket closed. Reconnecting attemped soon', e.reason);
            //setTimeout(function() {
                //this.connect();
            //}, 1000);
        };

        this._ws.onerror = function(err) {
            console.error('Socket error:', err.message, 'Closing socket');
            this._ws.close();
        };
    }
}
