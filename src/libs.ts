import * as fs from "fs";
import * as path from "path";
import { Subject } from "rxjs";
import * as WebSocket from "ws";
import * as os from "os";
import * as express from "express";
import * as http from "http";
import fetch from "node-fetch";

export { fs, path, Subject, WebSocket, express, http, fetch };

export const hostname = os.hostname();

export const logSubject = new Subject<Log>();
export const errorSubject = new Subject<Error>();

export type Log = {
    content: string;
    filepath: string;
    hostname: string;
};

export type Config = {
    inflow: {
        enabled: boolean;
        port: number;
        host: string;
    };
    outflow: {
        enabled: boolean;
        url: string;
    };
    watcher: {
        enabled: boolean;
        paths: string[];
        filePositionsDataPath: string;
    };
    gui: {
        enabled: boolean;
        port: number;
        host: string;
    };
    elastic: {
        enabled: false;
        url: string;
    };
};

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
