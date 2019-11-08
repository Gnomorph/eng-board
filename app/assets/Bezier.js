import * as Draw from "./Draw.js";

export async function draw(context, p0, p1, p2, p3, width, style) {
    if (!(p0 && p1 && p2 && p3)) { return }

    style = style || "rgb(0, 0, 0)";
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = style;
    //context.lineCap = "round";

    let dabs = Math.abs(p2[0] - p1[0]) + Math.abs(p2[1] - p1[1]);

    if (dabs > width) {
        let pLeft = getBezierRight(p0, p1, p2);
        let pRight = getBezierLeft(p1, p2, p3);

        context.moveTo(...p1);
        //context.strokeStyle = "#00ff00";

        context.bezierCurveTo(...pLeft, ...pRight, ...p2, width);
        context.stroke();

        //Draw.arc(context, pLeft, width, "#ff0000");
        //Draw.arc(context, pRight, width, "#00ff00");
        //context.lineTo(...p2, width);
    } else {
        //context.strokeStyle = "#ff0000";
        //style = "#0000ff";
        context.moveTo(...p1);
        context.lineTo(...p2, width);
        context.stroke();
    }

    Draw.arc(context, p1, width, style);
    Draw.arc(context, p2, width, style);
    //style = "#0000ff";
    //Draw.arc(context, p1, width, style);
    //Draw.arc(context, p2, width, style);
    //always draw the arc
    //if (dabs < 100*width) {
    //Draw.arc(context, p1, width, style);
    //Draw.arc(context, p2, width, style);
    //}
}

function getBezierLeft(pl, p, pr) {
    let c, dummy;
    [c, dummy] = getBezierPoints(pl, p, pr);
    return c;
}

function getBezierRight(pl, p, pr) {
    let c, dummy;
    [dummy, c] = getBezierPoints(pl, p, pr);
    return c;
}

function getBezierPoints(pl, pc, pr) {
    let h = 0.4;

    let Dx = pr[0] - pl[0];
    let Dy = pr[1] - pl[1];

    let Dl = Math.sqrt(Math.pow(pl[0] - pc[0], 2) + Math.pow(pl[1] - pc[1], 2));
    let Dr = Math.sqrt(Math.pow(pr[0] - pc[0], 2) + Math.pow(pr[1] - pc[1], 2));

    let sl = h * Dl / (Dl + Dr);
    let sr = h * Dr / (Dl + Dr);

    let dlx = sl*Dx;
    let dly = sl*Dy;

    let drx = sr*Dx;
    let dry = sr*Dy;

    let cp1 = [ pc[0]  - dlx, pc[1]  - dly ];

    let cp2 = [ pc[0]  + drx, pc[1]  + dry ];

    return [cp1, cp2];
}
