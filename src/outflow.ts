import * as libs from "./libs";
import * as config from "./config";

export function start() {
    if (!config.outflow.enabled) {
        return;
    }

    const reconnector = new libs.Reconnector(() => {
        const ws = new libs.WebSocket(config.outflow.url);
        const subscription = libs.logSubject.bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(logs => {
                ws.send(JSON.stringify(logs));
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
