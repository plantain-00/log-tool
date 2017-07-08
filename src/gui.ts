import * as libs from "./libs";
import * as types from "./types";
import * as config from "./config";
import * as elastic from "./elastic";
import * as format from "./format";
import * as sqlite from "./sqlite";

const historySamples: types.SampleFrame[] = [];
const maxHistorySampleCount = 300;

export function start() {
    if (!config.gui.enabled) {
        return;
    }

    const server = libs.http.createServer();
    const wss = new libs.WebSocketServer({ server });
    const app = libs.express();

    app.use(libs.express.static(libs.path.resolve(__dirname, "../static")));

    libs.bufferedSampleSubject.subscribe((samples: types.Sample[]) => {
        historySamples.push({
            time: libs.getNow(),
            samples,
        });
        if (historySamples.length > maxHistorySampleCount) {
            historySamples.splice(0, historySamples.length - maxHistorySampleCount);
        }
    });

    wss.on("connection", ws => {
        const subscription = libs.bufferedFlowObservable.subscribe(flows => {
            const protocol: types.Protocol = {
                kind: types.ProtocolKind.flows,
                serverTime: libs.getNow(),
                flows,
            };
            ws.send(format.encode(protocol), { binary: config.protobuf.enabled });
        });
        ws.on("close", (code, name) => {
            subscription.unsubscribe();
        });
        if (config.elastic.enabled) {
            ws.on("message", (data: string, flag) => {
                try {
                    const protocol: types.Protocol = format.decode(data);
                    if (protocol.kind === types.ProtocolKind.search) {
                        if (protocol.search) {
                            elastic.search(protocol.search.content, protocol.search.time, protocol.search.hostname, protocol.search.from, protocol.search.size).then(result => {
                                const searchResult: types.Protocol = {
                                    kind: types.ProtocolKind.searchResult,
                                    requestId: protocol.requestId,
                                    searchResult: result,
                                };
                                ws.send(format.encode(searchResult), { binary: config.protobuf.enabled });
                            }, (error: Error) => {
                                const searchResult: types.Protocol = {
                                    kind: types.ProtocolKind.searchResult,
                                    requestId: protocol.requestId,
                                    error: error.message,
                                };
                                ws.send(format.encode(searchResult), { binary: config.protobuf.enabled });
                            });
                        } else {
                            const searchResult: types.Protocol = {
                                kind: types.ProtocolKind.searchResult,
                                requestId: protocol.requestId,
                                error: "no parameter",
                            };
                            ws.send(format.encode(searchResult), { binary: config.protobuf.enabled });
                        }
                    } else if (protocol.kind === types.ProtocolKind.resaveFailedLogs) {
                        elastic.resaveFailedLogs().then(result => {
                            const resaveFailedLogsResult: types.Protocol = {
                                kind: types.ProtocolKind.resaveFailedLogsResult,
                                requestId: protocol.requestId,
                                resaveFailedLogsResult: result,
                            };
                            ws.send(format.encode(resaveFailedLogsResult), { binary: config.protobuf.enabled });
                        }, error => {
                            const resaveFailedLogsResult: types.Protocol = {
                                kind: types.ProtocolKind.resaveFailedLogsResult,
                                requestId: protocol.requestId,
                                error: error.message,
                            };
                            ws.send(format.encode(resaveFailedLogsResult), { binary: config.protobuf.enabled });
                        });
                    } else if (protocol.kind === types.ProtocolKind.searchSamples) {
                        if (protocol.searchSamples) {
                            const from = Math.round(libs.moment(protocol.searchSamples.from).valueOf() / 1000);
                            const to = Math.round(libs.moment(protocol.searchSamples.to).valueOf() / 1000);
                            sqlite.querySamples(from, to).then(rows => {
                                const searchSamplesResult: types.Protocol = {
                                    kind: types.ProtocolKind.searchSamplesResult,
                                    requestId: protocol.requestId,
                                    searchSampleResult: rows,
                                };
                                ws.send(format.encode(searchSamplesResult), { binary: config.protobuf.enabled });
                            }, error => {
                                const searchSamplesResult: types.Protocol = {
                                    kind: types.ProtocolKind.searchSamplesResult,
                                    requestId: protocol.requestId,
                                    error: error.message,
                                };
                                ws.send(format.encode(searchSamplesResult), { binary: config.protobuf.enabled });
                            });
                        } else {
                            const searchSamplesResult: types.Protocol = {
                                kind: types.ProtocolKind.searchSamplesResult,
                                requestId: protocol.requestId,
                                error: "no parameter",
                            };
                            ws.send(format.encode(searchSamplesResult), { binary: config.protobuf.enabled });
                        }
                    } else {
                        libs.publishErrorMessage(`protocol kind ${protocol.kind} is not recognized.`);
                    }
                } catch (error) {
                    libs.publishError(error);
                }
            });
        }
        const protocol: types.Protocol = {
            kind: types.ProtocolKind.historySamples,
            historySamples,
        };
        ws.send(format.encode(protocol), { binary: config.protobuf.enabled });
    });

    server.on("request", app);
    server.listen(config.gui.port, config.gui.host);
}
