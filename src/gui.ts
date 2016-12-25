import * as libs from "./libs";

export function start(port: number, host: string) {
    const server = libs.http.createServer();
    const wss = new libs.WebSocket.Server({ server });
    const app = libs.express();

    app.use(libs.express.static(__dirname + "/static"));

    wss.on("connection", ws => {
        ws.send("hello");
    });

    server.on("request", app);
    server.listen(port, host);
}
