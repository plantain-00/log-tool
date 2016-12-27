import * as Vue from "vue";
import Component from "vue-class-component";
import * as types from "../src/types";
import { Reconnector } from "reconnection/browser";

let ws: WebSocket | undefined;

type Log = types.Log & {
    formattedContent?: string;
};

@Component({
    template: require("raw!./app.html"),
})
class App extends Vue {
    tabIndex = 0;
    logsSearchResult: Log[] = [];
    logsSearchResultCount = 0;
    logsPush: Log[] = [];
    errorsPush: string[] = [];
    q = "*";
    tab(tabIndex: number) {
        this.tabIndex = tabIndex;
    }
    search() {
        if (ws) {
            ws.send(JSON.stringify({
                kind: "search logs",
                q: this.q,
            } as types.SearchLogsMessage));
        }
    }
}

const app = new App({
    el: "#body",
});

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const reconnector = new Reconnector(() => {
    ws = new WebSocket(`${wsProtocol}//${location.host}`);
    ws.onmessage = event => {
        const message: types.Message = JSON.parse(event.data);
        if (message.kind === "search logs result") {
            app.logsSearchResult = message.result.hits.hits.map(h => {
                const log: Log = h._source;
                try {
                    log.formattedContent = JSON.stringify(JSON.parse(h._source.content), null, "  ");
                } catch (error) {
                    console.log(error);
                }
                return log;
            });
            app.logsSearchResultCount = message.result.hits.total;
        } else if (message.kind === "push logs") {
            for (const l of message.logs) {
                const log: Log = l;
                try {
                    log.formattedContent = JSON.stringify(JSON.parse(log.content), null, "  ");
                } catch (error) {
                    console.log(error);
                }
                app.logsPush.push(log);
            }
        } else if (message.kind === "push error") {
            for (const error of message.errors) {
                app.errorsPush.unshift(error);
            }
        }
    };
    ws.onclose = () => {
        reconnector.reconnect();
    };
    ws.onopen = () => {
        reconnector.reset();
    };
});
