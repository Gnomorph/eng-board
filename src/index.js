import { Debug } from "./app/Debug.js";
import { Menu } from "./app/Menu.js";
import { Surface } from "./app/Surface.js";
import { DrawTip } from "./app/DrawTip.js";
import { PointerInput } from "./app/PointerInput.js";
import { TouchInput } from "./app/TouchInput.js";

import "./main.scss";

let surface = new Surface(document.getElementById("bg-board"));
document.debug = new Debug(surface);

function buildSetSurfaceTip(surface) {
    return function (tip) { surface.tip = tip; }
}

let setSurfaceTip = buildSetSurfaceTip(surface);
let penTip = new DrawTip("pen", 5, "#000000", setSurfaceTip);
let pencilTip = new DrawTip("pencil", 5, "#000000", setSurfaceTip);
let eraserTip = new DrawTip("eraser", 25, null, setSurfaceTip);

surface.tip = penTip;

let menu = new Menu(surface);

let pointerInput = new PointerInput(surface);
let touchInput = new TouchInput(surface);
