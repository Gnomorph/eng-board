'use strict'

export class QuadNode {
    constructor(left, right, top, bottom) {
        this.maxLength = 10;

        this._values = [];
        this._nw = null;
        this._ne = null;
        this._sw = null;
        this._se = null;

        this._xi = left;
        this._xf = right;
        this._yi = top;
        this._yf = bottom;

        this._nwCount = 0;
        this._neCount = 0;
        this._swCount = 0;
        this._seCount = 0;
    }

    get isLeaf() {
        if (checkArrays(this._nw, this._ne, this._sw, this._se)) {
            return true;
        } else if (checkNodes(this._nw, this._ne, this._sw, this._se)) {
            return false;
        } else {
            throw "inconsistent state"
        }
    }

    get NS() {
        this._NS = this._NS || (this._xi + this.xf)/2
        return this._NS;
    }

    get EW() {
        this._EW = this._EW || (this._yi + this.yf)/2
        return this._EW;
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

    get length() {
        return this._count || this.values.length +
            this._nwCount + this._neCount + this.swCount + this.seCount;
    }

    split() {
        this._nw = new QuadNode(this._xi, this._xm, this._yi, this._ym,
            this._nw);
        this._ne = new QuadNode(this._xm, this._xf, this._yi, this._ym,
            this._ne);
        this._sw = new QuadNode(this._xi, this._xm, this._ym, this._yf,
            this._sw);
        this._se = new QuadNode(this._xm, this._xf, this._ym, this._yf,
            this._se);
    }

    combine() {
        this._nw = this._nw.getChildren();
        this._ne = this._ne.getChildren();
        this._sw = this._sw.getChildren();
        this._se = this._se.getChildren();
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
        if (this.length <= this.maxLength) {
            this.values.push(region);
        } else (this.length > this.maxLength) {
        }
        if (this.nwContains(region)) {              // check if it fits in NW
            this._nwCount += this.NW.add(region);
        } else if (this.neContains(region)) {       // check if it fits in NE
            this._neCount += this.NE.add(region);
        } else if (this.swContains(region)) {       // check if it fits in SW
            this._swCount += this.SW.add(region);
        } else if (this.seContains(region)) {       // check if it fits in SE
            this._seCount += this.SE.add(region);
        } else if (this.contains(region)){      // check if it fits this node
            this.values.push(region);
        }

        return this.length;
    }

    nwContains(region) {
        return checkContains(poly, this.left, this.NS, this.top, this.EW);

    neContains(region) {
        return checkContains(poly, this.NS, this.right, this.top, this.EW);
    }

    swContains(poly) {
        return checkContains(poly, this.left, this.NS, this.EW, this.bottom);
    }

    seContains(poly) {
        return checkContains(poly, this.NS, this.right, this.EW, this.bottom);
    }

}

function checkArrays(...inputs) {
    return inputs.reduce((a, c) => { a = a && Array.isArray(c); }, true);
}

function checkNodes(...nodes) {
    return nodes.reduce((a, c) => { a = a && c instanceof QuadNode; }, true);
}

function checkContains(polygon, left, right, top, bottom) {
    return (left < polygon.left) && (right > polygon.right) &&
        (top < polygon.top) && (bottom > polygon.bottom);
}
