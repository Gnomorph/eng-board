'use strict'

class MessageBus {

    constructor() {
        this.channels = {};
    }

    subscribe(channel, callback) {
        this.channels[channel] = this.channels[channel] || [];
        this.channels[channel].push(callback);
    }

    publish(channel, data) {
        for (let callback of this.channels[channel] || []) {
            callback(data);
        }
    }

    /************************
     * Publish Action Methods
     ************************/

    newInput(id, type, point, tilt, pressure) {
        data = { action: 'newInput', id: id, type: type, point: point };

        if (tilt) { data.tilt = tilt }
        if (pressure) { data.pressure = pressure }

        this.publish('input', data);
    }

    addInput(id, point, tilt, pressure) {
        data = { action: 'addInput', id: id, point: point };

        if (tilt) { data.tilt = tilt }
        if (pressure) { data.pressure = pressure }

        this.publish('input', data);
    }

    endInput(id) {
        this.publish('input', { action: 'endInput', id: id });
    }
}

export {
    MessageBus
}
