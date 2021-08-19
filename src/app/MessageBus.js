'use strict'

class MessageBus {

    constructor() {
        this.channels = {};
    }

    subscribe(channel, callback) {
        this.channels[channel] = this.channels[channel] || [];
        this.channels[channel].push(callback);
        callback("SUBSCRIBED!");
        console.log(this.channels);
    }

    publish(channel, data) {
        for (let callback of this.channels[channel] || []) {
            callback(data);
        }
    }
}

export {
    MessageBus
}
