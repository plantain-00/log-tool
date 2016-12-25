import * as libs from "./libs";

export function start(port: number, host: string) {
    const wss = new libs.WebSocket.Server({ port, host });
    wss.on("connection", ws => {
        ws.on("message", (logs: libs.Log[], flag) => {
            for (const log of logs) {
                libs.logSubject.next(log);
            }
        });
    });
}
