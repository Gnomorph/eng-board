export class CircularBuffer {
    constructor() {
        this._head = 0
        this._history = [null, null, null, null]
    }

    push(value) {
        this._head = this.circularNext();
        this._history[this._head] = value;
    }

    pop() {
        let value = this._history[this._head];
        this._history[this._head] = null;

        this.circularPrev();
        return value;
    }

    get length() {
        return this._history.length;
    }

    set length(value) {
        if (value >= 0 && value < this.length) {
            for(let i=1; i<=this.length-value; i++) {
                this._history[ (i + this.length) % this.length ] = null;
            }
        }
    }

    get all() {
        let output = [];
        for (let i=1; i<=this.length; i++) {
            output.push( this._history[(this._head+i+this.length) % this.length] );
        }

        return output;
    }

    circularNext() {
        return (++this._head)%this._history.length;
    }

    circularPrev() {
        return (--this._head + this._history.length)%this._history.length;
    }
}

