export class StrokeSegment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    intersects(other) {
        //let orientations1 = orientation(this.p1, other.p1, this.p2);
        //let orientations2 = orientation(this.p1, other.p1, other.p2);
        //let orientations3 = orientation(this.p2, other.p2, this.p1);
        //let orientations4 = orientation(this.p2, other.p2, other.p1);
        let orientations1 = orientation(this.p1, other.p1, this.p2);
        let orientations2 = orientation(this.p1, other.p1, other.p2);
        let orientations3 = orientation(this.p2, other.p2, this.p1);
        let orientations4 = orientation(this.p2, other.p2, other.p1);

        // General case
        if (orientation1 != orientatoion2 &&
            orientation3 != orientation4) {
            return true;
        }

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        else if (orientation1 == 0 && onSegment(this.p1, this.p2, other.p1)) {
            return true;
        }

        // p1, q1 and q2 are colinear and q2 lies on segment p1q1
        else if (orientatoion2 == 0 && onSegment(this.p1, other.p2, other.p1)) {
            return true; }

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        else if (orientation3 == 0 && onSegment(this.p2, this.p1, other.p2)) {
            return true; }

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        else if (orientation4 == 0 && onSegment(this.p2, other.p1, other.p2)) {
            return true; }
        else {
            return false; // Doesn't fall in any of the above cases
        }
    }
}

orientation(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    // Lines are Colinear
    if (val == 0) return 0;

    return (val > 0) ? 1: 2;
}

onSegment(p, q, r) {
    if (q.x <= Math.Max(p.x, r.x) && q.x >= Math.Min(p.x, r.x) &&
        q.y <= Math.Max(p.y, r.y) && q.y >= Math.Min(p.y, r.y))
        return true;

    return false;
}
