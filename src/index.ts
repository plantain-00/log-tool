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

libs.errorSubject.subscribe(error => {
    console.log(error);
});

libs.errorWithTimeSubject.subscribe(error => {
    console.log(error);
});

// error test
// setInterval(() => {
//     libs.errorWithTimeSubject.next({
//         time: libs.getNow(),
//         error: "test error",
//     });
// }, 2000);

// sample test
// function randomInteger(min: number, range: number) {
//     return Math.floor(Math.random() * range) + min;
// }
// function getRandomValues() {
//     return {
//         httpRequestCount: randomInteger(10, 20),
//         httpResponseTime: randomInteger(1000, 2000),
//     };
// }
// let i = 0;
// setInterval(() => {
//     i++;
//     if (i < 10 || i > 20) {
//         libs.sampleSubject.next({
//             hostname: "#1",
//             port: 9000,
//             values: getRandomValues(),
//         });
//     }
//     if (i > 5) {
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
// }, 1000);
