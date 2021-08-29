import "./main.scss";

import { Debug } from "./app/Debug.js";
import { Menu } from "./app/Menu.js";
import { Surface } from "./app/Surface.js";
import { DrawTip } from "stroke";
import { PointerInput } from "./app/PointerInput.js";
import { TouchInput } from "./app/TouchInput.js";
import { MessageBus } from "./app/MessageBus.js";
import { NetworkBridge } from "./app/NetworkBridge.js";
import { StateManager } from "./app/StateManager.js";
import { EraserManager } from "./app/EraserManager.js";
import { StrokeMaker } from "./app/StrokeMaker.js";

// All modules interact through a Message Bus
let bus = new MessageBus();
//document.bus = bus;

let surface = new Surface(bus.client("Surface"), document.getElementById("bg-board"));

new NetworkBridge(bus.client("NetworkBridge"));
new StateManager(bus.client("StateManager"), surface);
new EraserManager(bus.client("EraserManager"));
new StrokeMaker(bus.client("StrokeMaker"));

new Menu(bus.client("Menu"));
new TouchInput(bus.client("TouchInput"), surface);
new PointerInput(bus.client("PointerInput"), surface);

new Debug(bus.client("Debug"), surface);

//bus.publish('tools', {
    //type: 'DrawTip',
    //data: new DrawTip("pen", 5, "#000000", ()=>{}),
//});
