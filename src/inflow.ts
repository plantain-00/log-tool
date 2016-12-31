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
        ws.on("message", (inflowString: string, flag) => {
            try {
                const inflows: types.Inflow[] = JSON.parse(inflowString);
                for (const inflow of inflows) {
                    if (inflow.kind === "log") {
                        libs.logSubject.next(inflow.log);
                    } else if (inflow.kind === "error") {
                        libs.errorSubject.next(inflow.error);
                    } else if (inflow.kind === "sample") {
                        libs.sampleSubject.next(inflow.sample);
                    }
                }
            } catch (error) {
                libs.errorSubject.next(error);
            }
        });
    });
}
