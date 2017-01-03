import * as libs from "./libs";
import * as types from "./types";
import * as config from "./config";
import { search } from "./elastic";
import * as format from "./format";

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
                const protocol: types.Protocol = {
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
            ws.on("message", (data: string, flag) => {
                try {
                    const protocol: types.Protocol = format.decode(data);
                    if (protocol.kind === "search") {
                        search(protocol.search!.q, protocol.search!.from, protocol.search!.size).then(result => {
                            const searchResult: types.Protocol = {
                                kind: "search result",
                                searchResult: result,
                            };
                            ws.send(format.encode(searchResult), { binary: config.protobuf.enabled });
                        }, error => {
                            libs.publishError(error);
                        });
                    } else {
                        libs.publishErrorMessage(`protocol kind ${protocol.kind} is not recognized.`);
                    }
                } catch (error) {
                    libs.publishError(error);
                }
            });
        }
        const protocol: types.Protocol = {
            kind: "history samples",
            historySamples,
        };
        ws.send(format.encode(protocol), { binary: config.protobuf.enabled });
    });

    server.on("request", app);
    server.listen(config.gui.port, config.gui.host);
}
