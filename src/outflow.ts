import * as libs from "./libs";
import * as config from "./config";

export function start() {
    if (!config.outflow.enabled) {
        return;
    }

    const reconnector = new libs.Reconnector(() => {
        const ws = new libs.WebSocket(config.outflow.url);
        const subscription = libs.Subject.merge(libs.logSubject, libs.errorSubject, libs.sampleSubject)
            .bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(outflows => {
                ws.send(JSON.stringify(outflows));
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
