"use strict";
const libs = require("./libs");
const watcher = require("./watcher");
const gui = require("./gui");
const inflow = require("./inflow");
const outflow = require("./outflow");
const elastic = require("./elastic");
const format = require("./format");
watcher.start();
gui.start();
inflow.start();
outflow.start();
elastic.start();
format.start();
console.log("log tool started.");
libs.logSubject.subscribe(log => {
    console.log(log);
});
libs.errorSubject.subscribe(error => {
    console.log(error);
});
libs.errorWithTimeSubject.subscribe(error => {
    console.log(error);
});
// error test
// libs.Observable.interval(2000).filter((v, i) => i < 3).subscribe(() => {
//     libs.errorWithTimeSubject.next({
//         time: libs.getNow(),
//         error: `Failed to execute phase [query], all shards failed
// 	at org.elasticsearch.action.search.AbstractSearchAsyncAction.onFirstPhaseResult(AbstractSearchAsyncAction.java:206)
// 	at org.elasticsearch.action.search.AbstractSearchAsyncAction$1.onFailure(AbstractSearchAsyncAction.java:152)
// 	at org.elasticsearch.action.ActionListenerResponseHandler.handleException(ActionListenerResponseHandler.java:46)
// 	at org.elasticsearch.transport.TransportService$DirectResponseChannel.processException(TransportService.java:855)
// 	at org.elasticsearch.transport.TransportService$DirectResponseChannel.sendResponse(TransportService.java:833)
// 	at org.elasticsearch.transport.TransportService$4.onFailure(TransportService.java:387)
// 	at org.elasticsearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:39)
// 	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
// 	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
// 	at java.lang.Thread.run(Thread.java:745)`,
//     });
// });
// sample test
// function randomInteger(min: number, range: number) {
//     return Math.floor(Math.random() * range) + min;
// }
// function getRandomValues() {
//     return {
//         httpRequestCount: randomInteger(10, 20),
//         httpResponseTime: randomInteger(500, 1000),
//     };
// }
// let i = 0;
// libs.Observable.interval(1000).subscribe(() => {
//     i++;
//     if (i < 10 || i > 20) {
//         libs.sampleSubject.next({
//             hostname: "#1",
//             port: 9000,
//             values: getRandomValues(),
//         });
//     }
//     if (i > 15) {
//         libs.sampleSubject.next({
//             hostname: "#1",
//             port: 9001,
//             values: getRandomValues(),
//         });
//     }
//     libs.sampleSubject.next({
//         hostname: "#2",
//         port: 9000,
//         values: getRandomValues(),
//     });
//     libs.sampleSubject.next({
//         hostname: "#2",
//         port: 9001,
//         values: getRandomValues(),
//     });
// });
