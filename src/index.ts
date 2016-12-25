import * as libs from "./libs";
import * as watcher from "./watcher";
import * as inflow from "./inflow";
import * as outflow from "./outflow";

const configurationFilePath = process.argv[2] || "../log-tool.config.js";
const {config}: { config: libs.Config } = require(configurationFilePath);
if (config.inflow.enabled) {
    inflow.start(config.inflow.port, config.inflow.host);
}
if (config.outflow.enabled) {
    outflow.start(config.outflow.url);
}
if (config.watcher.enabled) {
    watcher.start(config.watcher.paths, config.watcher.filePositionsDataPath);
}

libs.logSubject.subscribe(log => {
    console.log(log);
});

libs.errorSubject.subscribe(log => {
    console.log(log);
});
