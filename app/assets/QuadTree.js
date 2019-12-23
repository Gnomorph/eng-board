import { QuadNode } from "./QuadNode.js";
import { QuadData } from "./QuadData.js";

export class QuadTree {
    constructor() {
        this.root = new QuadNode();
    }

    add(data, left, right, top, bottom) {
        this.root.add(new QuadData(data, left, right, top, bottom));
    }

    getValues(x, y) {
        return this.root.getValues(x, y);
    }

    getBounds(x, y) {
        return this.root.getBounds(x, y);
    }

    getAll() {
        this.root.getAll();
    }

    getAllBounds() {
        this.root.getAllBounds();
    }

    purge() {
        this.root.purge();
    }
}
