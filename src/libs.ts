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
export const errorSubject = new Subject<Error>();
export const sampleSubject = new Subject<types.Sample>();
export const errorWithTimeSubject = new Subject<types.ErrorWithTime>();

export const flowObservable: Observable<types.Flow> = Observable.merge(logSubject.map(log => {
    return {
        kind: "log",
        log,
    };
}), errorSubject.map(error => {
    return {
        kind: "error",
        error: {
            time: getNow(),
            error: error.stack || error.message,
        },
    };
}), sampleSubject.map(sample => {
    return {
        kind: "sample",
        sample,
    };
}), errorWithTimeSubject.map(error => {
    return {
        kind: "error",
        error,
    };
}));

export function getNow() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

export function statAsync(pathname: string) {
    return new Promise<fs.Stats | undefined>((resolve, reject) => {
        fs.stat(pathname, (error, stats) => {
            if (error) {
                errorSubject.next(error);
            }
            resolve(stats);
        });
    });
}

export function readFileAsync(filepath: string) {
    return new Promise<string | undefined>((resolve, reject) => {
        fs.readFile(filepath, "utf8", (error, data) => {
            if (error) {
                errorSubject.next(error);
            }
            resolve(data);
        });
    });
}

export function readDirAsync(filepath: string) {
    return new Promise<string[] | undefined>((resolve, reject) => {
        fs.readdir(filepath, (error, files) => {
            if (error) {
                errorSubject.next(error);
            }
            resolve(files);
        });
    });
}
