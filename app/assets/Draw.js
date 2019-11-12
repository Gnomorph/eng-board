export { arc, point, line, lines }

async function arc(context, point, width, style) {
    context.beginPath();
    context.lineWidth = 0;
    context.strokeStyle = style;
    context.arc(...point, width/2, 0, 2 * Math.PI, false);
    context.fillStyle = style || "rgb(0, 0, 0)";
    context.closePath();
    context.fill();
}

async function point(context, x, y, width, style) {
    context.beginPath();
    context.lineWidth = 0;
    context.arc(x, y, width/2, 0, 2 * Math.PI, false);
    context.fillStyle = style || "rgb(0, 0, 0)";
    context.fill();
}

async function lines(context, path, width, color) {
    if (!path) { return; }
    let points = path._points;

    pen.hasUpdates = true;
    context.lineWidth = width;
    context.strokeStyle = color;

    context.beginPath();

    context.moveTo(...points[0]);

    let last;
    for(let point of points) {
        if (last) {
            context.lineTo(...point);
        }

        last = point;
    }
    context.stroke();
}

async function line(pen, context, from, to, pressure, style, interpolate) {
    if (!from) { return; }

    pen.hasUpdates = true;
    interpolate = interpolate || false;
    context.lineWidth = width;
    context.strokeStyle = style;
    context.moveTo(...from);
    //context.lineTo(0, 0);
    //context.stroke();
    if (interpolate) {
        pressure = Math.max(pressure, pen.pressureThreashold);
        let dp = (pressure - pen.pressure)/interpolate;
        let dx = (to[0] - from[0])/interpolate;
        let dy = (to[1] - from[1])/interpolate;

        let ip = pen.pressure;
        let ix = from[0];
        let iy = from[1];
        for (let i=0; i<interpolate; i++) {
            context.beginPath();
            context.moveTo(ix, iy);
            ip += dp;
            ix += dx;
            iy += dy;

            let randStyle = "";
            do {
                randStyle = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
            } while (randStyle.length != 7);

            //context.strokeStyle = randStyle
            context.strokeStyle = style;
            context.lineWidth = pen.width*ip;
            context.lineTo(ix, iy);
            context.stroke();
        }
    } else {
        context.beginPath();
        context.lineTo(...to);
        context.stroke();
    }
}
