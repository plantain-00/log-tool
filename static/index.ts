import * as Vue from "vue";
import Component from "vue-class-component";
import * as types from "../src/types";

let ws: WebSocket | undefined;

type Log = types.Log & {
    formattedContent?: string;
};
type ErrorPush = Error & {
    formattedError?: string;
};

@Component({
    template: require("raw!./app.html"),
})
class App extends Vue {
    tabIndex = 0;
    logsSearchResult: Log[] = [];
    logsSearchResultCount = 0;
    logsPush: Log[] = [];
    errorsPush: ErrorPush[] = [];
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

interface ReconnectorOption {
    startTimeout: number;
    increaseRate: number;
    endTimeout: number;
}

class Reconnector {
    private eventTarget = document.createElement("div");
    private timeout: number;
    private startTimeout = 3000;
    private increaseRate = 1.5;
    private endTimeout = 30000;
    constructor(action: () => void, options?: Partial<ReconnectorOption>) {
        if (options) {
            if (typeof options.startTimeout === "number") {
                this.startTimeout = options.startTimeout;
            }
            if (typeof options.increaseRate === "number") {
                this.increaseRate = options.increaseRate;
            }
            if (typeof options.endTimeout === "number") {
                this.endTimeout = options.endTimeout;
            }
        }

        this.timeout = this.startTimeout;
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
            for (const e of message.errors) {
                const error: ErrorPush = e;
                try {
                    error.formattedError = JSON.stringify(error, null, "  ");
                } catch (error) {
                    console.log(error);
                }
                app.errorsPush.unshift(error);
            }
        }
    };
    ws.onclose = () => {
        reconnector.reconnect();
    };
    ws.onopen = () => {
        reconnector.resetTimeout();
    };
});
