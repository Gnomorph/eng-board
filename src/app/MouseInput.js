class MouseInput {
    constructor(type) {
        this._id = Math.floor(Math.random()*2147483647);
        this._type = type;
    }

    get id() { return this._id; }

    get type() { return this._type; }

    pointData(x, y) {
        return {
            id: this._id,
            point: [x, y],
            tip: this._type,
        };
    }
}

export {
    MouseInput
}
