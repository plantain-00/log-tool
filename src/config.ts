import * as libs from "./libs";

type Config = {
    inflow: {
        enabled: boolean;
        port: number;
        host: string;
        httpFallbackPath: string;
    };
    outflow: {
        enabled: boolean;
        url: string;
    };
    watcher: {
        enabled: boolean;
        paths: string[];
        filePositionsDataPath: string;
        parseLine: (line: string, moment: typeof libs.moment, filepath: string) => {
            skip: boolean;
            time: string;
            content: string;
        };
    };
    gui: {
        enabled: boolean;
        port: number;
        host: string;
    };
    elastic: {
        enabled: boolean;
        url: string;
    };
    protobuf: {
        enabled: boolean;
    };
    folderSizeWatcher: {
        enabled: boolean;
        folders: { [name: string]: string };
    };
    countLogs: {
        enabled: boolean;
    };
    sqlite: {
        filePath: string;
        samples: boolean;
    };
};

const configurationFilePath = process.argv[2] || "../log-tool.config.js";
export const {elastic, gui, inflow, outflow, watcher, protobuf, folderSizeWatcher, countLogs, sqlite}: Config = require(configurationFilePath);
