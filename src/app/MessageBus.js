'use strict'

class MessageBus {
    constructor() {
        this.channels = {};
    }

    _publish(src_id, channel, data) {
        for (let [dst_id, callback] of this.channels[channel] || []) {
            if (src_id != dst_id) { callback(data); }
        }
    }

    _subscribe(id, channel, callback) {
        this.channels[channel] = this.channels[channel] || [];
        this.channels[channel].push([id, callback]);
    }

    /************************
     * Publish Action Methods
     ************************/

    client() {
        let id = Math.floor(Math.random()*2147483647);

        let pub = function(channel, data) {
            this._publish(id, channel, data);
        };

        let sub = function(channel, callback) {
            this._subscribe(id, channel, callback);
        };

        return {
            publish: pub.bind(this),
            subscribe: sub.bind(this),
        };
    }
}

export {
    MessageBus
}
