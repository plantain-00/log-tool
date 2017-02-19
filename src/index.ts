import * as libs from "./libs";
import * as watcher from "./watcher";
import * as gui from "./gui";
import * as inflow from "./inflow";
import * as outflow from "./outflow";
import * as elastic from "./elastic";
import * as format from "./format";
import * as sqlite from "./sqlite";
import * as folderSizeWatcher from "./folderSizeWatcher";
import * as countLogs from "./countLogs";
import * as os from "./os";

watcher.start();
gui.start();
inflow.start();
outflow.start();
elastic.start();
format.start();
sqlite.start();
folderSizeWatcher.start();
countLogs.start();
os.start();

console.log("log tool started.");

libs.logSubject.subscribe(log => {
    console.log(log);
});
