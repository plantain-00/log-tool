import * as libs from "./libs";
import * as config from "./config";
import * as types from "./types";
import * as format from "./format";

export function start() {
    if (!config.outflow.enabled) {
        return;
    }

    const reconnector = new libs.Reconnector(() => {
        const ws = new libs.WebSocket(config.outflow.url);
        const subscription = libs.flowObservable
            .bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(flows => {
                const protocol: types.Protocol = {
                    kind: "flows",
                    flows,
                };
                ws.send(format.encode(protocol), { binary: config.protobuf.enabled });
            });
        ws.on("close", (code, name) => {
            subscription.unsubscribe();
            reconnector.reconnect();
        });
        ws.on("open", () => {
            reconnector.reset();
        });
    });
}
