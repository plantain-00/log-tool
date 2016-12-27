import * as libs from "./libs";
import * as types from "./types";
import * as config from "./config";
import { search } from "./elastic";

export function start() {
    if (!config.gui.enabled) {
        return;
    }

    const server = libs.http.createServer();
    const wss = new libs.WebSocket.Server({ server });
    const app = libs.express();

    app.use(libs.express.static(libs.path.resolve(__dirname, "../static")));

    wss.on("connection", ws => {
        const logSubscription = libs.logSubject.bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(logs => {
                ws.send(JSON.stringify({
                    kind: "push logs",
                    logs,
                } as types.PushLogsMessage));
            });
        const errorSubscription = libs.errorSubject.bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(errors => {
                ws.send(JSON.stringify({
                    kind: "push error",
                    errors: errors.map(e => e.stack),
                } as types.PushErrorsMessage));
            });
        ws.on("close", (code, name) => {
            logSubscription.unsubscribe();
            errorSubscription.unsubscribe();
        });
        if (config.elastic.enabled) {
            ws.on("message", (data: string, flag) => {
                try {
                    const message: types.Message = JSON.parse(data);
                    if (message.kind === "search logs") {
                        search(config.elastic.url, message.q).then(result => {
                            ws.send(JSON.stringify({
                                kind: "search logs result",
                                result,
                            } as types.SearchLogsResultMessage));
                        }, error => {
                            libs.errorSubject.next(error);
                        });
                    } else {
                        libs.errorSubject.next(new Error(`message kind ${message.kind} is not recognized.`));
                    }
                } catch (error) {
                    libs.errorSubject.next(error);
                }
            });
        }
    });

    server.on("request", app);
    server.listen(config.gui.port, config.gui.host);
}
