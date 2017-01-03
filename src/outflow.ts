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
        const sender = new libs.Sender(ws);
        const subscription = libs.flowObservable
            .bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(flows => {
                const protocol: types.Protocol = {
                    kind: "flows",
                    flows,
                };
                sender.send(format.encode(protocol), { binary: config.protobuf.enabled });
            });
        ws.on("close", (code, message) => {
            libs.publishErrorMessage(`outflow connection closed with code: ${code} and message: ${message}`);
            subscription.unsubscribe();
            reconnector.reconnect();
        });
        ws.on("open", () => {
            reconnector.reset();
        });
    });
}
