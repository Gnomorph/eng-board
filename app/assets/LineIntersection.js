let p1 = new Point(1, 1);
let q1 = new Point(10, 1);
let p2 = new Point(1, 2);
let q2 = new Point(10, 2);

if(doIntersect(p1, q1, p2, q2)) {
    Console.WriteLine("Yes");
} else {
    Console.WriteLine("No");
}

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Given three colinear points p, q, r, the function checks if
    // point q lies on line segment 'pr'
    onSegment(Point p, Point q, Point r) {
        if (q.x <= Math.Max(p.x, r.x) && q.x >= Math.Min(p.x, r.x) &&
            q.y <= Math.Max(p.y, r.y) && q.y >= Math.Min(p.y, r.y))
            return true;

        return false;
    }

    // To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are colinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
    orientation(Point p, Point q, Point r) {
        // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
        // for details of below formula.
        let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

        if (val == 0) return 0; // colinear

        return (val > 0) ? 1: 2; // clock or counterclock wise
    }

    // The main function that returns true if line segment 'p1q1'
    // and 'p2q2' intersect.
    doIntersect(Point p1, Point q1, Point p2, Point q2) {
        // Find the four orientations needed for general and
        // special cases
        let orientations1 = orientation(p1, q1, p2);
        let orientations2 = orientation(p1, q1, q2);
        let orientations3 = orientation(p2, q2, p1);
        let orientations4 = orientation(p2, q2, q1);

        // General case
        if (orientation1 != orientatoion2 &&
            orientation3 != orientation4) { return true; }

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        if (orientation1 == 0 && onSegment(p1, p2, q1)) { return true; }

        // p1, q1 and q2 are colinear and q2 lies on segment p1q1
        if (orientatoion2 == 0 && onSegment(p1, q2, q1)) { return true; }

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        if (orientation3 == 0 && onSegment(p2, p1, q2)) { return true; }

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        if (orientation4 == 0 && onSegment(p2, q1, q2)) { return true; }

        return false; // Doesn't fall in any of the above cases
    }

}
