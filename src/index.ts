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

function randomInteger(min: number, range: number) {
    return Math.floor(Math.random() * range) + min;
}

setInterval(() => {
    libs.sampleSubject.next({
        hostname: "#1",
        port: 9000,
        values: {
            httpRequestCount: randomInteger(10, 20),
            httpResponseTime: randomInteger(100, 200),
        },
    });
    libs.sampleSubject.next({
        hostname: "#1",
        port: 9001,
        values: {
            httpRequestCount: randomInteger(10, 20),
            httpResponseTime: randomInteger(100, 200),
        },
    });
    libs.sampleSubject.next({
        hostname: "#2",
        port: 9000,
        values: {
            httpRequestCount: randomInteger(10, 20),
            httpResponseTime: randomInteger(100, 200),
        },
    });
    libs.sampleSubject.next({
        hostname: "#2",
        port: 9001,
        values: {
            httpRequestCount: randomInteger(10, 20),
            httpResponseTime: randomInteger(100, 200),
        },
    });
}, 1000);
