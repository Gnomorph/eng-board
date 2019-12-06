'use strict'

//import { Browser } from "./Browser.js";
import { StrokePoint } from "./StrokePoint.js";

export class Stroke {
    constructor(id, type) {
        this._id = id;
        this._type = type || "pen";

        this._path = [];
    }

    *[Symbol.iterator]() {
        for (let point of this._path) {
            yield point;
        }
    }

    get id() { return this._id }

    get type() { return this._type }

    get path() {
        // return a copy of the path
        console.log("warning, we made a copy of the path!");
        return JSON.parse(this.toString());
    }

    get last() {
        return this._path[this._path.length-1];
    }

    addXY(x, y, tiltX, tiltY) {
        this._path.push(new StrokePoint(x, y, tiltX, tiltY));
    }

    add(point) {
        this._path.push(point);
    }

    toString() {
        return "[ " + this._path.map(x => x.toString()).join(", ") + " ]";
    }

    // this fixes usability for the surface pen eraser
    kill(id, callback) {
        if (id == null && callback == null) {
            clearTimeout(this._killTimer);
            this._killTimer = null;
        } else {
            if (this.type == "eraser") {
                clearTimeout(this._killTimer);
                this._killTimer = setTimeout(callback, 100, id);
            } else {
                callback(id);
            }

        }
    }
}
