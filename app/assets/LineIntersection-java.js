// A C++ program to check if two given line segments intersect
#include <iostream>
using namespace std;

struct Point
{
    int x;
    int y;
};

// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
bool onSegment(Point p, Point q, Point r)
{
    if (q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) &&
        q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y))
       return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
int orientation(Point p, Point q, Point r)
{
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    int val = (q.y - p.y) * (r.x - q.x) -
              (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0;  // colinear

    return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
bool doIntersect(Point p1, Point q1, Point p2, Point q2)
{
    // Find the four orientations needed for general and
    // special cases
    int o1 = orientation(p1, q1, p2);
    int o2 = orientation(p1, q1, q2);
    int o3 = orientation(p2, q2, p1);
    int o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

// Driver program to test above functions
int main()
{
    struct Point p1 = {1, 1}, q1 = {10, 1};
    struct Point p2 = {1, 2}, q2 = {10, 2};

    doIntersect(p1, q1, p2, q2)? cout << "Yes\n": cout << "No\n";

    p1 = {10, 0}, q1 = {0, 10};
    p2 = {0, 0}, q2 = {10, 10};
    doIntersect(p1, q1, p2, q2)? cout << "Yes\n": cout << "No\n";

    p1 = {-5, -5}, q1 = {0, 0};
    p2 = {1, 1}, q2 = {10, 10};
    doIntersect(p1, q1, p2, q2)? cout << "Yes\n": cout << "No\n";

    return 0;
}


















// Java program to check if two given line segments intersect
class GFG
{

static class Point
{
    int x;
    int y;

        public Point(int x, int y)
        {
            this.x = x;
            this.y = y;
        }

};

// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
static boolean onSegment(Point p, Point q, Point r)
{
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
static int orientation(Point p, Point q, Point r)
{
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    int val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0; // colinear

    return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
static boolean doIntersect(Point p1, Point q1, Point p2, Point q2)
{
    // Find the four orientations needed for general and
    // special cases
    int o1 = orientation(p1, q1, p2);
    int o2 = orientation(p1, q1, q2);
    int o3 = orientation(p2, q2, p1);
    int o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

// Driver code
public static void main(String[] args)
{
    Point p1 = new Point(1, 1);
    Point q1 = new Point(10, 1);
    Point p2 = new Point(1, 2);
    Point q2 = new Point(10, 2);

    if(doIntersect(p1, q1, p2, q2))
        System.out.println("Yes");
    else
        System.out.println("No");

    p1 = new Point(10, 1); q1 = new Point(0, 10);
    p2 = new Point(0, 0); q2 = new Point(10, 10);
    if(doIntersect(p1, q1, p2, q2))
            System.out.println("Yes");
    else
        System.out.println("No");

    p1 = new Point(-5, -5); q1 = new Point(0, 0);
    p2 = new Point(1, 1); q2 = new Point(10, 10);;
    if(doIntersect(p1, q1, p2, q2))
        System.out.println("Yes");
    else
        System.out.println("No");
}
}

























// C# program to check if two given line segments intersect
using System;
using System.Collections.Generic;

class GFG
{

public class Point
{
    public int x;
    public int y;

    public Point(int x, int y)
    {
        this.x = x;
        this.y = y;
    }

};

// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
static Boolean onSegment(Point p, Point q, Point r)
{
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
static int orientation(Point p, Point q, Point r)
{
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    int val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0; // colinear

    return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
static Boolean doIntersect(Point p1, Point q1, Point p2, Point q2)
{
    // Find the four orientations needed for general and
    // special cases
    int o1 = orientation(p1, q1, p2);
    int o2 = orientation(p1, q1, q2);
    int o3 = orientation(p2, q2, p1);
    int o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

// Driver code
public static void Main(String[] args)
{
    Point p1 = new Point(1, 1);
    Point q1 = new Point(10, 1);
    Point p2 = new Point(1, 2);
    Point q2 = new Point(10, 2);

    if(doIntersect(p1, q1, p2, q2))
        Console.WriteLine("Yes");
    else
        Console.WriteLine("No");

    p1 = new Point(10, 1); q1 = new Point(0, 10);
    p2 = new Point(0, 0); q2 = new Point(10, 10);
    if(doIntersect(p1, q1, p2, q2))
            Console.WriteLine("Yes");
    else
        Console.WriteLine("No");

    p1 = new Point(-5, -5); q1 = new Point(0, 0);
    p2 = new Point(1, 1); q2 = new Point(10, 10);;
    if(doIntersect(p1, q1, p2, q2))
        Console.WriteLine("Yes");
    else
        Console.WriteLine("No");
}
}

/* This code contributed by PrinciRaj1992 */

Output:

No
Yes
No

Sources:
http://www.dcs.gla.ac.uk/~pat/52233/slides/Geometry1x1.pdf
Introduction to Algorithms 3rd Edition by Clifford Stein, Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest

Please write comments if you find anything incorrect, or you want to share more information about the topic discussed above


Recommended Posts:

    Given n line segments, find if any two segments intersect
    Equation of straight line passing through a given point which bisects it into two equal line segments
    Maximum possible intersection by moving centers of line segments
    Klee's Algorithm (Length Of Union Of Segments of a line)
    Number of horizontal or vertical line segments to connect 3 points
    Check if two given circles touch or intersect each other
    Check if four segments form a rectangle
    Check whether two points (x1, y1) and (x2, y2) lie on same side of a given line or not
    Check if a line passes through the origin
    Check whether the point (x, y) lies on a given line
    Check if a line touches or intersects a circle
    Check if it is possible to draw a straight line with the given direction cosines
    Check if a line at 45 degree can divide the plane into two equal weight parts
    Number of parallelograms when n horizontal parallel lines intersect m vertical parallellines
    Maximum number of segments that can contain the given points


Improved By : princi singh, princiraj1992



Article Tags :
Geometric
Mathematical
Adobe
Geometric-Lines
Snapdeal
Zomato
Practice Tags :
Snapdeal
Adobe
Zomato
Mathematical
Geometric

thumb_up
20


3.7

Based on 112 vote(s)
Please write to us at contribute@geeksforgeeks.org to report any issue with the above content.
Post navigation
Previous
first_page Random number generator in arbitrary probability distribution fashion
Next
last_page
How to check if a given point lies inside or outside a polygon?




Writing code in comment? Please use ide.geeksforgeeks.org, generate link and share the link here.


auto




Most popular in Geometric

    Program to find Area of Triangle inscribed in N-sided Regular Polygon
    C++ Program to Illustrate Trigonometric functions
    Number of triangles that can be formed
    Find the radii of the circles which are lined in a row, and distance between the centers of first and last circle is given
    Find the side of the squares which are lined in a row, and distance between the centers of first and last square is given


Most visited in Mathematical

    Find two vertices of an isosceles triangle in which there is rectangle with opposite corners (0, 0) and (X, Y)
    Check whether it is possible to convert A into B
    Number of elements from the array which are reachable after performing given operations on D
    Find the minimum number of elements that should be removed to make an array good

