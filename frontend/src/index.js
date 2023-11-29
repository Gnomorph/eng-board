import "./main.scss";

import { Debug } from "./app/Debug.js";
import { Menu } from "./app/Menu.js";
import { Surface } from "./app/Surface.js";
import { DrawTip } from "drawing-strokes";
import { PointerInput } from "./app/PointerInput.js";
import MessageBus from "./app/MessageBus.js";
import { NetworkBridge } from "./app/NetworkBridge.js";
import { StateManager } from "./app/StateManager.js";
import { EraserManager } from "./app/EraserManager.js";
import { StrokeMaker } from "./app/StrokeMaker.js";

export default function run(room) {
    // All modules interact through a Message Bus
    let actions = ["draw", "input", "stroke", "pen", "events", "timeline", "debug"];
    let bus = new MessageBus(actions);

    let surface = new Surface(bus.client("Surface"), document.getElementById("bg-board"));

    new NetworkBridge(bus.client("NetworkBridge"), room);

    new StateManager(bus.client("StateManager"), surface);
    new EraserManager(bus.client("EraserManager"));
    new StrokeMaker(bus.client("StrokeMaker"));

    new Menu(bus.client("Menu"));
    new PointerInput(bus.client("PointerInput"), surface);

    new Debug(bus.client("Debug"), surface);
}
