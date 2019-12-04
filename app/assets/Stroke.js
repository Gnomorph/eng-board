'use strict'

//import { Browser } from "./Browser.js";
import { StrokePoint } from "./StrokePoint.js";

export class Stroke {
    constructor(id) {
        this._id = id;

        this._path = [];
    }

    *[Symbol.iterator]() {
        for (let point of this._path) {
            yield point;
        }
    }

    get id() { return this._id }

    get path() {
        // return a copy of the path
        console.log("warning, we made a copy of the path!");
        return JSON.parse(this.toString());
    }

    get last() {
        return this._path[this._path.length-1];
    }

    addXY(x, y) {
        this._path.push(new StrokePoint(x, y));
    }

    add(point) {
        this._path.push(point);
    }

    toString() {
        return "[ " + this._path.map(x => x.toString()).join(", ") + " ]";
    }
}
