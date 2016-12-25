import * as libs from "./libs";

export function start(url: string) {
    const ws = new libs.WebSocket(url);
    const subscription = libs.logSubject.bufferTime(1000)
        .filter(s => s.length > 0)
        .subscribe(logs => {
            ws.send(JSON.stringify(logs));
        });
    ws.on("close", (code, name) => {
        subscription.unsubscribe();
    });
}
