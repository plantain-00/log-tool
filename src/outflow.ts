import * as libs from "./libs";
import * as config from "./config";
import * as types from "./types";
import * as format from "./format";
import { saveOutflowLog } from "./sqlite";

export function start() {
    if (!config.outflow.enabled) {
        return;
    }

    let ws: libs.WebSocket;
    let sender: libs.Sender;
    const subscription = libs.flowObservable
        .bufferTime(1000)
        .filter(s => s.length > 0)
        .subscribe(flows => {
            const protocol: types.Protocol = {
                kind: "flows",
                flows,
            };
            const message = format.encode(protocol);
            if (ws && ws.readyState === ws.OPEN && sender) {
                sender.send(message, { binary: config.protobuf.enabled }, () => {
                    saveOutflowLog(message);
                });
            } else {
                saveOutflowLog(message);
            }
        });
    const reconnector = new libs.Reconnector(() => {
        ws = new libs.WebSocket(config.outflow.url);
        sender = new libs.Sender(ws);

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
