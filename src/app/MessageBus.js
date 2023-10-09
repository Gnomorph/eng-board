'use strict'

export default class MessageBus {
    constructor(actions) {
        this.channels = {};
        actions.forEach((action) => this.channels[action] = []);
    }

    _verify(channel) {
        if (!(channel in this.channels)) {
            throw `Channel ${channel} does not exits`;
        }
    }

    _broadcast(channel, action, data) {
        this._verify(channel);

        this.channels[channel]
            .forEach(([dst_id, callback]) => {
                callback(action, data)
            });
    }

    _publish(src_id, channel, action, data) {
        this._verify(channel);

        this.channels[channel]
            .filter(([dst_id, callback]) => dst_id != src_id)
            .forEach(([dst_id, callback]) => {
                callback(action, data)
            });
    }

    _subscribe(id, channel, callback) {
        this._verify(channel);
        this.channels[channel].push([id, callback]);
    }

    /************************
     * Publish Action Methods
     ************************/

    client(name) {
        let id = Math.floor(Math.random()*2147483647);

        let all = function(channel, action, data) {
            //console.log(name);
            this._broadcast(channel, action, data);
        };

        let pub = function(channel, action, data) {
            //console.log(name);
            this._publish(id, channel, action, data);
        };

        let sub = function(channel, callback) {
            //console.log(name);
            this._subscribe(id, channel, callback);
        };

        return {
            broadcast: all.bind(this),
            publish: pub.bind(this),
            subscribe: sub.bind(this),
        };
    }
}
