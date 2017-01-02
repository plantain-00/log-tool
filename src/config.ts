import * as libs from "./libs";

type Config = {
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
};

const configurationFilePath = process.argv[2] || "../log-tool.config.js";
export const {elastic, gui, inflow, outflow, watcher, protobuf}: Config = require(configurationFilePath);
