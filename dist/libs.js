"use strict";
const fs = require("fs");
exports.fs = fs;
const path = require("path");
exports.path = path;
const rxjs_1 = require("rxjs");
exports.Subject = rxjs_1.Subject;
exports.Observable = rxjs_1.Observable;
const WebSocket = require("ws");
exports.WebSocket = WebSocket;
const os = require("os");
const express = require("express");
exports.express = express;
const http = require("http");
exports.http = http;
const node_fetch_1 = require("node-fetch");
exports.fetch = node_fetch_1.default;
const browser_1 = require("reconnection/browser");
exports.Reconnector = browser_1.Reconnector;
const moment = require("moment");
exports.moment = moment;
const uws_1 = require("uws");
exports.WebSocketServer = uws_1.Server;
const protobuf = require("protobufjs");
exports.protobuf = protobuf;
exports.hostname = os.hostname();
exports.logSubject = new rxjs_1.Subject();
exports.errorSubject = new rxjs_1.Subject();
exports.sampleSubject = new rxjs_1.Subject();
exports.errorWithTimeSubject = new rxjs_1.Subject();
exports.flowObservable = rxjs_1.Observable.merge(exports.logSubject.map(log => {
    return {
        kind: "log",
        log,
    };
}), exports.errorSubject.map(error => {
    return {
        kind: "error",
        error: {
            time: getNow(),
            error: error.stack || error.message,
        },
    };
}), exports.sampleSubject.map(sample => {
    return {
        kind: "sample",
        sample,
    };
}), exports.errorWithTimeSubject.map(error => {
    return {
        kind: "error",
        error,
    };
}));
function getNow() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}
exports.getNow = getNow;
function statAsync(pathname) {
    return new Promise((resolve, reject) => {
        fs.stat(pathname, (error, stats) => {
            if (error) {
                exports.errorSubject.next(error);
            }
            resolve(stats);
        });
    });
}
exports.statAsync = statAsync;
function readFileAsync(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, "utf8", (error, data) => {
            if (error) {
                exports.errorSubject.next(error);
            }
            resolve(data);
        });
    });
}
exports.readFileAsync = readFileAsync;
function readDirAsync(filepath) {
    return new Promise((resolve, reject) => {
        fs.readdir(filepath, (error, files) => {
            if (error) {
                exports.errorSubject.next(error);
            }
            resolve(files);
        });
    });
}
exports.readDirAsync = readDirAsync;
