'use strict'

export class QuadData {
    constructor(data, left, right, top, bottom) {
        this._data = data;

        this._xi = left;
        this._xf = right;
        this._yi = top;
        this._yf = bottom;
    }

    get xi(){
        return this._xi;
    }

    get xf() {
        return this._xf;
    }

    get yi() {
        return this._yi;
    }

    get yf() {
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
