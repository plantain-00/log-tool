import * as Vue from "vue";
import Component from "vue-class-component";
import * as types from "../src/types";

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

class Reconnector {
    private eventTarget = document.createElement("div");
    private timeout: number;
    constructor(action: () => void, private startTimeout: number = 3000, private increaseRate = 1.5, private endTimeout = 30000) {
        this.timeout = startTimeout;
        this.eventTarget.addEventListener("reconnect", () => {
            action();
        });
        action();
    }
    reconnect() {
        console.log(this.timeout);
        setTimeout(() => {
            if (this.timeout > this.endTimeout) {
                this.timeout = this.endTimeout;
            } else if (this.timeout < this.endTimeout) {
                this.timeout = Math.min(this.timeout * this.increaseRate, this.endTimeout);
            }
            this.eventTarget.dispatchEvent(this.generateEvent("reconnect"));
        }, this.timeout);
    }
    resetTimeout() {
        this.timeout = this.startTimeout;
    }
    private generateEvent(typeArg: string) {
        const event = document.createEvent("CustomEvent");
        event.initCustomEvent(typeArg, false, false, undefined);
        return event;
    }
}

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const reconnector = new Reconnector(() => {
    ws = new WebSocket(`${wsProtocol}//${location.host}`);
    ws.onmessage = event => {
        const message: types.Message = JSON.parse(event.data);
        if (message.kind === "search logs result") {
            app.logsSearchResult = message.result.hits.hits.map(h => {
                const log: Log = {
                    content: h._source.content,
                    filepath: h._source.filepath,
                    hostname: h._source.hostname,
                };
                try {
                    log.formattedContent = JSON.stringify(JSON.parse(h._source.content), null, "  ");
                } catch (error) {
                    console.log(error);
                }
                return log;
            });
            app.logsSearchResultCount = message.result.hits.total;
        }
    };
    ws.onclose = () => {
        reconnector.reconnect();
    };
    ws.onopen = () => {
        reconnector.resetTimeout();
    };
});
