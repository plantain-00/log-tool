import * as libs from "./libs";

export function start(port: number, host: string) {
    const server = libs.http.createServer();
    const wss = new libs.WebSocket.Server({ server });
    const app = libs.express();

    app.use(libs.express.static(libs.path.resolve(__dirname, "../static")));

    wss.on("connection", ws => {
        const subscription = libs.logSubject.bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(logs => {
                ws.send(JSON.stringify(logs));
            });
        ws.on("close", (code, name) => {
            subscription.unsubscribe();
        });
    });

    server.on("request", app);
    server.listen(port, host);
}
