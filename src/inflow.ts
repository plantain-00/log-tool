import * as libs from "./libs";
import * as config from "./config";
import * as types from "./types";

export function start() {
    if (!config.inflow.enabled) {
        return;
    }

    const wss = new libs.WebSocketServer({
        port: config.inflow.port,
        host: config.inflow.host,
    });
    wss.on("connection", ws => {
        ws.on("message", (logString: string, flag) => {
            try {
                const logs: types.Log[] = JSON.parse(logString);
                for (const log of logs) {
                    libs.logSubject.next(log);
                }
            } catch (error) {
                libs.errorSubject.next(error);
            }
        });
    });
}
