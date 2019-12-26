'use strict'

export class QuadNode {
    constructor(left, right, top, bot) {
        this.maxLength = 10;

        this._values = [];
        this._childValues = [];
        this._nw = null;
        this._ne = null;
        this._sw = null;
        this._se = null;

        this._xi = left;
        this._xf = right;
        this._yi = top;
        this._yf = bot;

        this._nwCount = 0;
        this._neCount = 0;
        this._swCount = 0;
        this._seCount = 0;
    }

    /**
     **
     ** Accessors
     **
     */

    get length() {
        return this._values.length + this.childLength;
    }

    get childLength() {
        return this._childValues.length +
            this._nwCount + this._neCount + this._swCount + this._seCount;
    }

    get xm() { return this._xm = this._xm || (this._xi + this.xf)/2 }
    get ym() { return this._ym = this._ym || (this._yi + this.yf)/2 }

    get xi() { return this._xi; }
    get xf() { return this._xf; }
    get yi() { return this._yi; }
    get yf() { return this._yf; }

    get NW() {
        return this._nw = this._nw ||
            new QuadNode(this._xi, this._xm, this._yi, this._ym, this._nw);
    }

    get NE() {
        return this._ne = this._ne ||
            new QuadNode(this._xm, this._xf, this._yi, this._ym, this._ne);
    }

    get SW() {
        return this._sw = this._sw ||
            new QuadNode(this._xi, this._xm, this._ym, this._yf, this._sw);
    }

    get SE() {
        return this._se = this._se ||
            new QuadNode(this._xm, this._xf, this._ym, this._yf, this._se);
    }

    /**
     **
     ** Public Methods
     **
     */

    //
    // Add data to this node (or children) and handle splitting if needed
    //
    add(data) {
        if (this._containsData(data)) {
            if (this._rootContains(data)) {
                this._values.push(data);
            } else {
                this._childValues.push(data);
                this._split();
            }
        }

        return this.length;
    }

    //
    // Remove data from this node (or children) and handle combining if needed
    //
    del(region) {

    }

    purge() {
        this._values.length = 0;
        this._childValues.length = 0;

        if (this._nw) { this._nw.purge(); }
        if (this._ne) { this._ne.purge(); }
        if (this._sw) { this._sw.purge(); }
        if (this._se) { this._se.purge(); }

        this._nw = null
        this._ne = null
        this._sw = null
        this._se = null

        this._nwCount = null
        this._neCount = null
        this._swCount = null
        this._seCount = null
    }

    getAll() {
        let data = []
        data = data.concat(this._values);
        data = data.concat(this._childValues);

        getChildOutputs(data, this.getAll);

        return data;
    }

    getRect(l, r, t, b) {
        let data = [];

        if (this._containsRect(l, r, t, b)) {
            data = data.concat(this._values);
            data = data.concat(this._childValues);

            data = this._addChildOutputs(this.getRect, data, l, r, t, b);
        }

        return data;
    }

    getValues(x, y) {
        let data = []

        if (this._containsPoint(x, y)) {
            data = data.concat(this._values);
            data = data.concat(this._childValues);

            data = this._addChildOutputs(this.getValues, data, x, y);
        }

        return data;
    }

    getAllBounds(x, y) {
        let data = []

        if (this.length > 0) {
            data.push([this.xi, this.xf, this.yi, this.yf]);

            data = this._addChildOutputs(this.getAllBounds, data, x, y);
        }

        return data;
    }

    getBounds(x, y) {
        let data = []

        if (this._containsPoint(x, y)) {
            data.push([this.xi, this.xf, this.yi, this.yf]);

            data = this._addChildOutputs(this.getBounds, data, x, y);
        }

        return data;
    }

    /**
     **
     ** Private Methods
     **
     */

    //
    // convert all data from child arrays into child nodes
    //
    _split() {
        if (this.childLength > this.maxLength &&
            this.xf-this.xi > 10 && this.yf-this.yi > 10) {
            for (let value of this._childValues) {
                this._nwCount = this.NW.add(value);
                this._neCount = this.NE.add(value);
                this._swCount = this.SW.add(value);
                this._seCount = this.SE.add(value);
            }

            this._childValues.length = 0;
        }
    }

    //
    // convert all data from child nodes into child array
    //
    _combine() {
        this._nw = this._nw.getChildren();
        this._ne = this._ne.getChildren();
        this._sw = this._sw.getChildren();
        this._se = this._se.getChildren();
    }

    _addChildOutputs(fn, data, ...args) {
        data = this._addChildOutput(this._nw, fn, data, ...args);
        data = this._addChildOutput(this._ne, fn, data, ...args);
        data = this._addChildOutput(this._sw, fn, data, ...args);
        data = this._addChildOutput(this._se, fn, data, ...args);

        return data;
    }

    _addChildOutput(child, fn, data, ...args) {
        return child ? data.concat(fn.apply(child, args)) : data;
    }

    _containsData(area) {
        return (this.xi <= area.xi) && (this.xf >= area.xf) &&
        (this.yi <= area.yi) && (this.yf >= area.yf);
    }

    _containsPoint(x, y) {
        return this.xi < x && x < this.xf && this.yi < y && y < this.yf;
    }

    _containsRect(l, r, t, b) {
        let exclusive = r<this.xi || this.xf<l || b<this.yi || this.yf<t;
        return !exclusive;
        //return this.xi < l && r < this.xf && this.yi < t && b < this.yf;
    }

    _rootContains(area) {
        return  this._containsData &&
            ((area.xi < this.xm) && (this.xm < area.xf) ||
                (area.yi < this.ym) && (this.ym < area.yf));
    }
}

    /*get isLeaf() {
        if (checkArrays(this._nw, this._ne, this._sw, this._se)) {
            return true;
        } else if (checkNodes(this._nw, this._ne, this._sw, this._se)) {
            return false;
        } else {
            throw "inconsistent state"
        }
    }*/

/*function checkArrays(...inputs) {
    return inputs.reduce((a, c) => { a = a && Array.isArray(c); }, true);
}

function checkNodes(...inputs) {
    return inputs.reduce((a, c) => { a = a && c instanceof QuadNode; }, true);
}*/

/*function checkContains(area, left, right, top, bot) {
    return (left < area.xi) && (right > area.xf) &&
        (top < area.yi) && (bot > area.yf);
}*/
