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

    libs.bufferedSampleSubject.subscribe(samples => {
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
            ws.send(format.encodeResponse({
                kind: types.ProtocolKind.flows,
                flows: {
                    serverTime: libs.getNow(),
                    flows,
                },
            }), { binary: config.protobuf.enabled });
        });
        ws.on("close", (code, name) => {
            subscription.unsubscribe();
        });
        if (config.elastic.enabled) {
            ws.on("message", (data: string, flag) => {
                try {
                    const protocol = format.decodeRequest(data);
                    if (protocol.kind === types.RequestProtocolKind.searchLogs) {
                        elastic.search(protocol.searchLogs, protocol.requestId).then(result => {
                            ws.send(format.encodeResponse({
                                kind: types.ProtocolKind.searchLogsResult,
                                searchLogsResult: result,
                            }), { binary: config.protobuf.enabled });
                        }, (error: Error) => {
                            ws.send(format.encodeResponse({
                                kind: types.ProtocolKind.searchLogsResult,
                                searchLogsResult: {
                                    kind: types.ResultKind.fail,
                                    requestId: protocol.requestId,
                                    error: error.message,
                                },
                            }), { binary: config.protobuf.enabled });
                        });
                    } else if (protocol.kind === types.RequestProtocolKind.resaveFailedLogs) {
                        elastic.resaveFailedLogs(protocol.requestId).then(result => {
                            ws.send(format.encodeResponse({
                                kind: types.ProtocolKind.resaveFailedLogsResult,
                                resaveFailedLogsResult: result,
                            }), { binary: config.protobuf.enabled });
                        }, error => {
                            ws.send(format.encodeResponse({
                                kind: types.ProtocolKind.resaveFailedLogsResult,
                                resaveFailedLogsResult: {
                                    kind: types.ResultKind.fail,
                                    requestId: protocol.requestId,
                                    error: error.message,
                                },
                            }), { binary: config.protobuf.enabled });
                        });
                    } else if (protocol.kind === types.RequestProtocolKind.searchSamples) {
                        const from = Math.round(libs.moment(protocol.searchSamples.from).valueOf() / 1000);
                        const to = Math.round(libs.moment(protocol.searchSamples.to).valueOf() / 1000);
                        sqlite.querySamples(from, to).then(rows => {
                            ws.send(format.encodeResponse({
                                kind: types.ProtocolKind.searchSamplesResult,
                                searchSamplesResult: {
                                    kind: types.ResultKind.success,
                                    requestId: protocol.requestId,
                                    searchSampleResult: rows,
                                },
                            }), { binary: config.protobuf.enabled });
                        }, error => {
                            ws.send(format.encodeResponse({
                                kind: types.ProtocolKind.searchSamplesResult,
                                searchSamplesResult: {
                                    kind: types.ResultKind.fail,
                                    requestId: protocol.requestId,
                                    error: error.message,
                                },
                            }), { binary: config.protobuf.enabled });
                        });
                    }
                } catch (error) {
                    libs.publishError(error);
                }
            });
        }
        ws.send(format.encodeResponse({
            kind: types.ProtocolKind.historySamples,
            historySamples,
        }), { binary: config.protobuf.enabled });
    });

    server.on("request", app);
    server.listen(config.gui.port, config.gui.host);
}
