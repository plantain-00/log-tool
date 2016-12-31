import * as libs from "./libs";
import * as types from "./types";
import * as config from "./config";
import { search } from "./elastic";

export function start() {
    if (!config.gui.enabled) {
        return;
    }

    const server = libs.http.createServer();
    const wss = new libs.WebSocketServer({ server });
    const app = libs.express();

    app.use(libs.express.static(libs.path.resolve(__dirname, "../static")));

    wss.on("connection", ws => {
        const logSubscription = libs.logSubject.bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(logs => {
                const message: types.Message = {
                    kind: "push logs",
                    logs,
                };
                ws.send(JSON.stringify(message));
            });
        const errorSubscription = libs.errorSubject.bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(errors => {
                const message: types.Message = {
                    kind: "push error",
                    errors,
                };
                ws.send(JSON.stringify(message));
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
                        search(message.q, message.from, message.size).then(result => {
                            const resultMessage: types.Message = {
                                kind: "search logs result",
                                result,
                            };
                            ws.send(JSON.stringify(resultMessage));
                        }, error => {
                            libs.errorSubject.next(error);
                        });
                    } else {
                        libs.errorSubject.next({
                            time: libs.getNow(),
                            error: `message kind ${message.kind} is not recognized.`,
                        });
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
