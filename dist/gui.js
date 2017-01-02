"use strict";
const libs = require("./libs");
const config = require("./config");
const elastic_1 = require("./elastic");
const format = require("./format");
const historySamples = [];
const maxHistorySampleCount = 300;
function start() {
    if (!config.gui.enabled) {
        return;
    }
    const server = libs.http.createServer();
    const wss = new libs.WebSocketServer({ server });
    const app = libs.express();
    app.use(libs.express.static(libs.path.resolve(__dirname, "../static")));
    libs.sampleSubject.bufferTime(1000)
        .filter(s => s.length > 0)
        .subscribe(samples => {
        historySamples.push({
            time: libs.getNow(),
            samples,
        });
        if (historySamples.length > maxHistorySampleCount) {
            historySamples.splice(0, historySamples.length - maxHistorySampleCount);
        }
    });
    wss.on("connection", ws => {
        const subscription = libs.flowObservable
            .bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(flows => {
            const protocol = {
                kind: "flows",
                serverTime: libs.getNow(),
                flows,
            };
            ws.send(format.encode(protocol), { binary: config.protobuf.enabled });
        });
        ws.on("close", (code, name) => {
            subscription.unsubscribe();
        });
        if (config.elastic.enabled) {
            ws.on("message", (data, flag) => {
                try {
                    const protocol = format.decode(data);
                    if (protocol.kind === "search") {
                        elastic_1.search(protocol.search.q, protocol.search.from, protocol.search.size).then(result => {
                            const searchResult = {
                                kind: "search result",
                                searchResult: result,
                            };
                            ws.send(format.encode(searchResult), { binary: config.protobuf.enabled });
                        }, error => {
                            libs.errorSubject.next(error);
                        });
                    }
                    else {
                        libs.errorWithTimeSubject.next({
                            time: libs.getNow(),
                            error: `protocol kind ${protocol.kind} is not recognized.`,
                        });
                    }
                }
                catch (error) {
                    libs.errorSubject.next(error);
                }
            });
        }
        const protocol = {
            kind: "history samples",
            historySamples,
        };
        ws.send(format.encode(protocol), { binary: config.protobuf.enabled });
    });
    server.on("request", app);
    server.listen(config.gui.port, config.gui.host);
}
exports.start = start;
