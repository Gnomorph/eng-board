import { QuadNode } from "./QuadNode.js";
import { QuadData } from "./QuadData.js";

/*
 * QuadTree Module
 *
 * This module is an interface for the Quad Tree module. Most methods simply
 * pass the intended actions to the root node.
 */
export class QuadTree {
    // create a new tree with the given bounds
    constructor(left, right, top, bottom) {
        this.root = new QuadNode(left, right, top, bottom);
    }

    // add data to the tree with the given bounds
    add(data, left, right, top, bottom) {
        this.root.add(new QuadData(data, left, right, top, bottom));
    }

    // Get all data values that co-exist at the given (x,y) coordinate
    getValues(x, y) {
        return this.root.getValues(x, y);
    }

    // Get the bounds of all values which co-exist at the given (x,y) coordinate
    getBounds(x, y) {
        return this.root.getBounds(x, y);
    }

    // Get all data stored in the tree
    getAll() {
        this.root.getAll();
    }

    // Get a list of bounds, one bounds for each element in the tree
    getAllBounds() {
        this.root.getAllBounds();
    }

    // public helper method to generate bounds around two points
    getRect(x1, y1, x2, y2) {
        let left = Math.min(x1, x2);
        let right = Math.max(x1, x2);
        let top = Math.min(y1, y2);
        let bottom = Math.max(y1, y2);

        return this.root.getRect(left, right, top, bottom);
    }

    // recursively delete all references to child nodes and data
    purge() {
        this.root.purge();
    }
}
