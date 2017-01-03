import * as fs from "fs";
import * as path from "path";
import { Subject, Observable } from "rxjs";
import * as WebSocket from "ws";
import * as os from "os";
import * as express from "express";
import * as http from "http";
import fetch from "node-fetch";
import * as types from "./types";
import { Reconnector } from "reconnection/browser";
import * as moment from "moment";
import { Server as WebSocketServer } from "uws";
import * as protobuf from "protobufjs";

export { fs, path, Subject, WebSocket, express, http, fetch, Reconnector, moment, WebSocketServer, Observable, protobuf };

export const hostname = os.hostname();

export const logSubject = new Subject<types.Log>();
export const sampleSubject = new Subject<types.Sample>();

export const flowObservable: Observable<types.Flow> = Observable.merge(logSubject.map(log => {
    return {
        kind: "log",
        log,
    };
}), sampleSubject.map(sample => {
    return {
        kind: "sample",
        sample,
    };
}));

export function publishError(error: Error) {
    logSubject.next({
        time: getNow(),
        hostname,
        filepath: "",
        content: error.stack || error.message,
    });
}

export function publishErrorMessage(message: string) {
    logSubject.next({
        time: getNow(),
        hostname,
        filepath: "",
        content: message,
    });
}

export function getNow() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

export function statAsync(pathname: string) {
    return new Promise<fs.Stats | undefined>((resolve, reject) => {
        fs.stat(pathname, (error, stats) => {
            if (error) {
                publishError(error);
            }
            resolve(stats);
        });
    });
}

export function readFileAsync(filepath: string) {
    return new Promise<string | undefined>((resolve, reject) => {
        fs.readFile(filepath, "utf8", (error, data) => {
            if (error) {
                publishError(error);
            }
            resolve(data);
        });
    });
}

export function readDirAsync(filepath: string) {
    return new Promise<string[] | undefined>((resolve, reject) => {
        fs.readdir(filepath, (error, files) => {
            if (error) {
                publishError(error);
            }
            resolve(files);
        });
    });
}

export class Sender {
    private timeout = 3000;
    constructor(private ws: WebSocket) { }
    send(message: any, options: {
        mask?: boolean | undefined;
        binary?: boolean | undefined;
    }) {
        this.ws.send(message, options, error1 => {
            if (error1) {
                setTimeout(() => {
                    this.ws.send(message, options, error2 => {
                        if (error2) {
                            setTimeout(() => {
                                this.ws.send(message, options, error3 => {
                                    if (error3) {
                                        // todo: alarm and save message
                                    }
                                });
                            }, this.timeout);
                        }
                    });
                }, this.timeout);
            }
        });
    }
}
