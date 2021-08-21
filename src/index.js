import "./main.scss";

import { Debug } from "./app/Debug.js";
import { Menu } from "./app/Menu.js";
import { Surface } from "./app/Surface.js";
import { DrawTip } from "./app/DrawTip.js";
import { PointerInput } from "./app/PointerInput.js";
import { TouchInput } from "./app/TouchInput.js";
import { MessageBus } from "./app/MessageBus.js";
import { NetworkBridge } from "./app/NetworkBridge.js";
import { StateManager } from "./app/StateManager.js";
import { StrokeMaker } from "./app/StrokeMaker.js";

// All modules interact through a Message Bus
let bus = new MessageBus();
document.bus = bus;

let surface = new Surface(bus, document.getElementById("bg-board"));

new NetworkBridge(bus);
new StateManager(bus, surface);
new StrokeMaker(bus);

new Menu(bus);
new TouchInput(bus, surface);
new PointerInput(bus, surface);

new Debug(bus, surface);

bus.publish('tools', {
    type: 'DrawTip',
    data: new DrawTip("pen", 5, "#000000", ()=>{}),
});
