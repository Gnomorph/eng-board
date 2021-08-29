import { StrokePoint, StrokePointFactory } from "stroke"

function EraserStrokeFactory(data) {
    let eraserStroke = new EraserStroke(data._id, data._type);

    eraserStroke.addXY(data._prev);
    eraserStroke.addXY(data._curr);

    //eraserStroke._id = data._id;
    //eraserStroke._type = data._type;

    //eraserStroke._curr = StrokePointFactory(data._curr);
    //eraserStroke._prev = StrokePointFactory(data._prev);

    return eraserStroke;
}

class EraserStroke {
    constructor(id, eraserType, x, y) {
        this._id = id;
        this._type = eraserType || 'standard';

        this._curr;
        this._prev;

        this.addXY(x, y);
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
        if (point instanceof StrokePoint) {
            this._prev = this._curr;
            this._curr = point;

        } else {
            throw ("not StrokePoint");
        }
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

export {
    EraserStroke,
    EraserStrokeFactory,
}
