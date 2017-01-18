import * as libs from "./libs";
import * as config from "./config";
import * as format from "./format";
import * as types from "./types";

function handleMessage(protocol: types.Protocol) {
    if (protocol.kind === "flows" && protocol.flows) {
        for (const flow of protocol.flows) {
            if (flow.kind === "log") {
                libs.logSubject.next(flow.log);
            } else if (flow.kind === "sample") {
                libs.sampleSubject.next(flow.sample);
            }
        }
    }
}

export function start() {
    if (!config.inflow.enabled) {
        return;
    }

    const server = libs.http.createServer();
    const wss = new libs.WebSocketServer({ server });
    const app = libs.express();

    app.use(libs.bodyParser.json());
    app.post(config.inflow.httpFallbackPath, (request, response) => {
        const protocol: types.Protocol = request.body;
        handleMessage(protocol);
        response.end();
    });

    wss.on("connection", ws => {
        ws.on("message", (inflowString: string, flag) => {
            try {
                const protocol = format.decode(inflowString);
                handleMessage(protocol);
            } catch (error) {
                libs.publishError(error);
            }
        });
    });

    server.on("request", app);
    server.listen(config.inflow.port, config.inflow.host);
}
