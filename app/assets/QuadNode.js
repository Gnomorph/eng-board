'use strict'

export class QuadNode {
    constructor(left, right, top, bottom) {
        this._values = [];
        this._nw = null;
        this._ne = null;
        this._sw = null;
        this._se = null;

        this._xi = left;
        this._xf = right;
        this._yi = top;
        this._yf = bottom;
    }

    get parent() {
        return this._parent();
    }

    get NW() {
        return this._nw;
    }

    get NE() {
        return this._ne;
    }

    get SE() {
        return this._se;
    }

    get SW() {
        return this._sw;
    }

    getValues(x, y) {

    }

    getChild(x, y) {
        if (this._nw && this._ne && this._se && this._sw) {
            if ( x < this._xi ) {
            } else if ( x < (this._xi+this._xf)/2 ) {
            } else if ( x < this._xf ) {
            }
        } else {
            return null;
        }
    }

    add(region) {
        // check if it fits a sub-region

        // if not, store it here
        this.values.push(region);
    }
}

function checkX() {
}

function checkY() {
}
