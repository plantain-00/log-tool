import * as fs from "fs";
import * as path from "path";
import { Subject, Observable } from "rxjs";
import * as WebSocket from "ws";
import * as os from "os";
import * as express from "express";
import * as http from "http";
import fetch from "node-fetch";
import * as types from "./types";
import Reconnector from "reconnection/nodejs/nodejs";
import * as moment from "moment";
import { Server as WebSocketServer } from "uws";
import * as protobuf from "protobufjs";
import * as sqlite3 from "sqlite3";
import * as bodyParser from "body-parser";
import * as Ajv from "ajv";
import * as _ from "lodash";

export { fs, path, Subject, WebSocket, express, http, fetch, Reconnector, moment, WebSocketServer, Observable, protobuf, sqlite3, bodyParser, _, os };

const ajv = new Ajv();
import requestProtocolJsonSchema = require("../static/request-protocol.json");
export const validateRequestProtocol = ajv.compile(requestProtocolJsonSchema);
import flowProtocolJsonSchema = require("../static/flow-protocol.json");
export const validateFlowProtocol = ajv.compile(flowProtocolJsonSchema);

export function print(message: any) {
    // tslint:disable-next-line:no-console
    console.log(message);
}

export const hostname = os.hostname();

export const logSubject = new Subject<types.Log>();
export const sampleSubject = new Subject<types.Sample>();

export const bufferedLogSubject = (logSubject as Observable<types.Log>).bufferTime(1000);

export const bufferedSampleSubject = (sampleSubject as Observable<types.Sample>)
    .bufferTime(1000)
    .filter((s: types.Sample[]) => s.length > 0)
    .map((samples: types.Sample[]) => {
        const result: types.Sample[] = [];
        for (const sample of samples) {
            const resultSample = result.find(r => r.hostname === sample.hostname && r.port === sample.port);
            if (resultSample) {
                Object.assign(resultSample.values, sample.values);
            } else {
                result.push(sample);
            }
        }
        return result;
    });

export const bufferedFlowObservable = Observable.merge(
    bufferedLogSubject
        .filter((logs: types.Log[]) => logs.length > 0)
        .map((logs: types.Log[]) => logs.map(log => {
            return {
                kind: types.FlowKind.log,
                log,
            };
        }),
    ),
    bufferedSampleSubject
        .map((samples: types.Sample[]) => (samples.map((sample: types.Sample) => {
            return {
                kind: types.FlowKind.sample,
                sample,
            };
        })),
    ))
    .bufferTime(1000)
    .filter(s => s.length > 0)
    .map(logsOrSamplesArray => {
        let result: types.Flow[] = [];
        for (const logsOrSamples of logsOrSamplesArray) {
            result = result.concat(logsOrSamples as types.Flow[]);
        }
        return result;
    });

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
        fs.access(pathname, err => {
            if (err) {
                resolve(undefined);
            } else {
                fs.stat(pathname, (error, stats) => {
                    if (error) {
                        publishError(error);
                    }
                    resolve(stats);
                });
            }
        });
    });
}

export function readFileAsync(filepath: string) {
    return new Promise<string | undefined>((resolve, reject) => {
        fs.access(filepath, err => {
            if (err) {
                resolve(undefined);
            } else {
                fs.readFile(filepath, "utf8", (error, data) => {
                    if (error) {
                        publishError(error);
                    }
                    resolve(data);
                });
            }
        });
    });
}

export function readDirAsync(filepath: string) {
    return new Promise<string[] | undefined>((resolve, reject) => {
        fs.access(filepath, err => {
            if (err) {
                resolve(undefined);
            } else {
                fs.readdir(filepath, (error, files) => {
                    if (error) {
                        publishError(error);
                    }
                    resolve(files);
                });
            }
        });
    });
}

export class Sender {
    private timeout = 3000;
    constructor(private ws: WebSocket) { }
    send(message: string | Uint8Array, options: { mask?: boolean | undefined; binary?: boolean | undefined; }, next: (isSuccess: boolean) => void) {
        this.ws.send(message, options, error1 => {
            if (error1) {
                publishError(error1);
                setTimeout(() => {
                    this.ws.send(message, options, error2 => {
                        if (error2) {
                            publishError(error2);
                            setTimeout(() => {
                                this.ws.send(message, options, error3 => {
                                    if (error3) {
                                        publishError(error3);
                                        next(false);
                                    } else {
                                        next(true);
                                    }
                                });
                            }, this.timeout);
                        } else {
                            next(true);
                        }
                    });
                }, this.timeout);
            } else {
                next(true);
            }
        });
    }
}
