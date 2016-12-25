import * as libs from "./libs";

export function start(port: number, host: string) {
    const wss = new libs.WebSocket.Server({ port, host });
    wss.on("connection", ws => {
        ws.on("message", (logString: string, flag) => {
            try {
                const logs: libs.Log[] = JSON.parse(logString);
                for (const log of logs) {
                    libs.logSubject.next(log);
                }
            } catch (error) {
                libs.errorSubject.next(error);
            }
        });
    });
}
