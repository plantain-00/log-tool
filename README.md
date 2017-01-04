[![Dependency Status](https://david-dm.org/plantain-00/log-tool.svg)](https://david-dm.org/plantain-00/log-tool)
[![devDependency Status](https://david-dm.org/plantain-00/log-tool/dev-status.svg)](https://david-dm.org/plantain-00/log-tool#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/log-tool.svg?branch=master)](https://travis-ci.org/plantain-00/log-tool)

# log-tool

#### features

+ watch log directories or files and read logs
+ transport logs to another log-tool server
+ save logs to elastic search server
+ push new logs to a web page, for monitor purpose
+ on the web page, search old logs
+ operate(filter, parse) logs as custom scripts

![](./architecture.png)

#### usage

```bash
node dist/index.js
```

or

```bash
node dist/index.js the-path-to-the-configuration-file
```

the default configuration file is `./log-tool.config.js`, its typical configuration is:

```js
module.exports = {
    /**
     * transport logs from another log-tool server.
     */
    inflow: {
        enabled: false,
        port: 8001,
        host: "localhost",
    },
    /**
     * transport logs to another log-tool server.
     */
    outflow: {
        enabled: false,
        url: "ws://localhost:8001",
    },
    /**
     * watch log directories or files and read logs.
     */
    watcher: {
        enabled: true,
        /**
         * paths of directories or files to be watched.
         */
        paths: [
            "./logs/",
        ],
        /**
         * path of the file that stores the status of the watched files.
         */
        filePositionsDataPath: "./log-tool.watcher.data",
        /**
         * parse a line of log string to get time and other valid information.
         * line: string, the log line,
         * moment: Object, the object from moment.js
         * filepath: string, the path of the log file
         */
        parseLine: (line, moment, filepath) => {
            return {
                skip: false, // if true, just skip this line of log
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                content: line, // the string that not include time, better be a json string
            };
        },
    },
    /**
     * push new logs to a web page, for monitor purpose.
     */
    gui: {
        enabled: true,
        port: 8000,
        host: "localhost",
    },
    /**
     * transport logs to elastic search server for searching old logs purpose.
     */
    elastic: {
        enabled: true,
        // `tool` is the index name, `logs` is the type name, they are all needed.
        url: "http://localhost:9200/tool/logs",
    },
    /**
     * transport data by protobuf binary, rather than json string.
     */
    protobuf: {
        enabled: true,
    },
    sqlite: {
        filePath: "./data.db",
        // if enabled, will save samples to sqlite.
        samples: true,
    },
};
```

#### protocol

The message should be a string from `JSON.stringify(protocol)` or a protobuf encoded binary, the protocol's type is:

```ts
type Protocol = {
    kind: "flows" | "search" | "search result" | "history samples",
    serverTime?: string;
    flows?: Flow[],
    search?: {
        q: string;
        from: number;
        size: number;
    };
    searchResult?: {
        total: number;
        logs: {
            time: string;
            content: string;
            filepath: string;
            hostname: string;
        }[];
    };
    historySamples?: {
        time: string;
        samples: {
            hostname: string;
            port: number;
            values: { [name: string]: number };
        }[];
    }[];
};

type Flow = {
    kind: "log";
    log: {
        time: string;
        content: string;
        filepath: string;
        hostname: string;
    };
}
|
{
    kind: "sample";
    sample: {
        hostname: string;
        port: number;
        values: { [name: string]: number };
    }
};
```

#### create index for elastic

```bash
curl -XPUT http://localhost:9200/tool -d '
{
    "mappings" : {
        "logs" : {
            "properties" : {
                "time": {
                    "type": "date", 
                    "format": "yyyy-MM-dd HH:mm:ss"
                },
                "content": {
                    "type": "string"
                },
                "filepath": {
                    "type": "string"
                },
                "hostname": {
                    "type": "string"
                }
            }
        }
    }
}'
```
