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
                const flows: types.Flow[] = JSON.parse(inflowString);
                for (const flow of flows) {
                    if (flow.kind === "log") {
                        libs.logSubject.next(flow.log);
                    } else if (flow.kind === "error") {
                        libs.errorWithTimeSubject.next(flow.error);
                    } else if (flow.kind === "sample") {
                        libs.sampleSubject.next(flow.sample);
                    }
                }
            } catch (error) {
                libs.errorSubject.next(error);
            }
        });
    });
}
