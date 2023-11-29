import run from "./index.js";

let room;
if (location.pathname != "" && location.pathname != "/") {
    let path = location.pathname.split('/');
    room = path[1];
}

run(room);
