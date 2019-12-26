import { StrokePoint } from "./StrokePoint.js";

export class StrokeSegment {
    constructor(stroke, p1, p2) {
        this.stroke = stroke;
        this.p1 = new StrokePoint(p1[0], p1[1], 0.001, 0.001);
        this.p2 = new StrokePoint(p2[0], p2[1], 0.001, 0.001);
    }

    *[Symbol.iterator]() {
        yield this.p1.x;
        yield this.p1.y;
        yield this.p2.x;
        yield this.p2.y;
    }

    intersects(other) {
        //let orientations1 = orientation(this.p1, other.p1, this.p2);
        //let orientations2 = orientation(this.p1, other.p1, other.p2);
        //let orientations3 = orientation(this.p2, other.p2, this.p1);
        //let orientations4 = orientation(this.p2, other.p2, other.p1);
        let orientation1L = orientation(this.p1, this.p2, other.p1);
        let orientation1R = orientation(this.p1, this.p2, other.p2);
        let orientation2L = orientation(other.p1, other.p2, this.p1);
        let orientation2R = orientation(other.p1, other.p2, this.p2);

        // General case
        if (orientation1L != orientation1R &&
            orientation2L != orientation2R) {
            return true;
        }

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        else if (orientation1L == 0 && onSegment(this.p1, this.p2, other.p1)) {
            return true;
        }

        // p1, q1 and q2 are colinear and q2 lies on segment p1q1
        else if (orientation1R == 0 && onSegment(this.p1, other.p2, other.p1)) {
            return true; }

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        else if (orientation2L == 0 && onSegment(this.p2, this.p1, other.p2)) {
            return true; }

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        else if (orientation2R == 0 && onSegment(this.p2, other.p1, other.p2)) {
            return true; }
        else {
            return false; // Doesn't fall in any of the above cases
        }
    }
}

function orientation(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    // Lines are Colinear
    if (val == 0) return 0;

    return (val > 0) ? 1: 2;
}

function onSegment(p, q, r) {
    return false;
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
        return true;

    return false;
}
