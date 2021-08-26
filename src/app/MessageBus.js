'use strict'

export class MessageBus {
    channels = {
        draw: [],
        input: [],
        stroke: [],
        pen: [],
        events: [],
        timeline: [],
        debug: [],
    }

    constructor() {
    }

    _broadcast(channel, action, data) {
        if (!(channel in this.channels)) {
            throw `Channel ${channel} does not exits`;
        }

        this.channels[channel]
            .forEach(([dst_id, callback]) => {
                callback(action, data)
            });
    }

    _publish(src_id, channel, action, data) {
        if (!(channel in this.channels)) {
            throw `Channel ${channel} does not exits`;
        }

        this.channels[channel]
            .filter(([dst_id, callback]) => dst_id != src_id)
            .forEach(([dst_id, callback]) => {
                callback(action, data)
            });
    }

    _subscribe(id, channel, callback) {
        if (!(channel in this.channels)) {
            throw `Channel ${channel} does not exits`;
        }

        this.channels[channel].push([id, callback]);
    }

    /************************
     * Publish Action Methods
     ************************/

    client() {
        let id = Math.floor(Math.random()*2147483647);

        let all = function(channel, action, data) {
            this._broadcast(channel, action, data);
        };

        let pub = function(channel, action, data) {
            this._publish(id, channel, action, data);
        };

        let sub = function(channel, callback) {
            this._subscribe(id, channel, callback);
        };

        return {
            broadcast: all.bind(this),
            publish: pub.bind(this),
            subscribe: sub.bind(this),
        };
    }
}
