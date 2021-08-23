import { StrokePoint } from "./StrokePoint.js"

export class Eraser {
    constructor(id, eraserType, x, y) {
        this._id = id;
        this._type = eraserType || 'standard';

        this._curr;
        this._prev;
    }

    get id() { return this._id }

    get type() { return this._type }

    get current() {
        return this._curr;
    }

    get previous() {
        return this._prev;
    }

    addXY(x, y, tiltX, tiltY) {
        this._prev = this._curr;
        this._curr = new StrokePoint(x, y, tiltX, tiltY);
    }

    add(point) {
        this._prev = this._curr;
        this._curr = point;
    }

    // TODO: UPDATE THIS OR REMOVE
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
