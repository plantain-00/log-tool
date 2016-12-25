import * as libs from "./libs";
import * as watcher from "./watcher";
import * as gui from "./gui";
import * as inflow from "./inflow";
import * as outflow from "./outflow";
import * as elastic from "./elastic";

watcher.start();
gui.start();
inflow.start();
outflow.start();
elastic.start();

console.log("log tool started.");

libs.logSubject.subscribe(log => {
    console.log(log);
});

libs.errorSubject.subscribe(log => {
    console.log(log);
});
