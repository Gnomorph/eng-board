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
        return this._childValues.length ||
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

    get SE() {
        return this._se = this._se ||
            new QuadNode(this._xi, this._xm, this._ym, this._yf, this._sw);
    }

    get SW() {
        return this._sw = this._sw ||
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

    getAll() {
        let output = []
        output = output.concat(this._values);
        output = output.concat(this._childValues);

        if (this._nw) { output = output.concat(this._nw.getAll()); }
        if (this._ne) { output = output.concat(this._ne.getAll()); }
        if (this._sw) { output = output.concat(this._sw.getAll()); }
        if (this._se) { output = output.concat(this._se.getAll()); }

        return output;
    }

    getValues(x, y) {
        let output = []

        if (this._containsPoint(x, y)) {
            output = output.concat(this._values);
            output = output.concat(this._childValues);

            if (this._nw) { output = output.concat(this._nw.getValues(x, y)); }
            if (this._ne) { output = output.concat(this._ne.getValues(x, y)); }
            if (this._sw) { output = output.concat(this._sw.getValues(x, y)); }
            if (this._se) { output = output.concat(this._se.getValues(x, y)); }
        }

        return output;
    }

    getAllBounds(x, y) {
        let output = []

        output.push([this.xi, this.xf, this.yi, this.yf]);

        if (this._nw) { output = output.concat(this._nw.getAllBounds(x, y)); }
        if (this._ne) { output = output.concat(this._ne.getAllBounds(x, y)); }
        if (this._sw) { output = output.concat(this._sw.getAllBounds(x, y)); }
        if (this._se) { output = output.concat(this._se.getAllBounds(x, y)); }

        return output;
    }

    getBounds(x, y) {
        let output = []

        if (this._containsPoint(x, y)) {
            output.push([this.xi, this.xf, this.yi, this.yf]);

            if (this._nw) { output = output.concat(this._nw.getBounds(x, y)); }
            if (this._ne) { output = output.concat(this._ne.getBounds(x, y)); }
            if (this._sw) { output = output.concat(this._sw.getBounds(x, y)); }
            if (this._se) { output = output.concat(this._se.getBounds(x, y)); }
        }

        return output;
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
        if (this.childLength > this.maxLength && this.xf-this.xi > 10 && this.yf-this.yi > 10) {
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

    _containsData(area) {
        return (this.xi <= area.xi) && (this.xf >= area.xf) &&
        (this.yi <= area.yi) && (this.yf >= area.yf);
    }

    _containsPoint(x, y) {
        return this.xi <= x && this.xf > x && this.yi <= y && this.yf > y;
    }

    _rootContains(area) {
        return  this._containsData &&
            ((area.xi < this.xm) && (area.xf > this.xm) ||
                (area.yi < this.ym) && (area.yf > this.ym));
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
