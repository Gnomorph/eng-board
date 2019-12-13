'use strict'

export class QuadRegion {
    constructor(data, left, right, top, bottom) {
        this._data = data;

        this._xi = left;
        this._xf = right;
        this._yi = top;
        this._yf = bottom;
    }

    get left(){
        return this._xi;
    }

    get right() {
        return this._xf;
    }

    get top() {
        return this._yi;
    }

    get bottom() {
        return this._yf;
    }

    get width() {
        this._width = this._width || this._xf - this._xi;
        return this._width;
    }

    get height() {
        this._height = this._height || this._yf - this._yi;
        return this._height;
    }
}
