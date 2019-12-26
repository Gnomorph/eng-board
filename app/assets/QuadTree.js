import { QuadNode } from "./QuadNode.js";
import { QuadData } from "./QuadData.js";

export class QuadTree {
    constructor(left, right, top, bottom) {
        this.root = new QuadNode(left, right, top, bottom);
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

    getRect(x1, y1, x2, y2) {
        let left = Math.min(x1, x2);
        let right = Math.max(x1, x2);
        let top = Math.min(y1, y2);
        let bottom = Math.max(y1, y2);

        return this.root.getRect(left, right, top, bottom);
    }

    purge() {
        this.root.purge();
    }
}
