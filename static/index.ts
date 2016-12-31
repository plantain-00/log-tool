import * as Vue from "vue";
import Component from "vue-class-component";
import * as types from "../src/types";
import { Reconnector } from "reconnection/browser";

let ws: WebSocket | undefined;

type Log = types.Log & {
    formattedContent?: string;
};

const initialQuery = `time:["1970-01-01 00:00:00" TO *]
AND hostname:*
AND filepath:*
AND *`;

const maxCount = 50;
function trimHistory<T>(array: T[]) {
    array.splice(0, array.length - maxCount);
}

@Component({
    template: require("raw!./app.html"),
})
class App extends Vue {
    tabIndex = 0;
    logsSearchResult: Log[] = [];
    logsSearchResultCount = 0;
    logsPush: Log[] = [];
    errorsPush: types.ErrorWithTime[] = [];
    q = initialQuery;
    from = 0;
    size = 10;
    newLogsCount = 0;
    newErrorsCount = 0;
    showRawLogResult = false;
    showFormattedLogResult = true;
    showRawLogPush = false;
    showFormattedLogPush = true;
    get leftCount() {
        return this.logsSearchResultCount - this.from - this.size;
    }
    tab(tabIndex: number) {
        this.tabIndex = tabIndex;
        if (this.tabIndex === 1) {
            this.newLogsCount = 0;
        } else if (this.tabIndex === 2) {
            this.newErrorsCount = 0;
        }
    }
    clearLogsSearchResult() {
        this.logsSearchResult = [];
    }
    clearLogsPush() {
        this.logsPush = [];
    }
    clearErrorsPush() {
        this.errorsPush = [];
    }
    search(freshStart: boolean) {
        if (freshStart) {
            this.from = 0;
            this.logsSearchResult = [];
            this.logsSearchResultCount = 0;
        } else {
            this.from += this.size;
        }
        if (ws) {
            const message: types.Protocol = {
                kind: "search",
                search: {
                    q: this.q,
                    from: this.from,
                    size: this.size,
                },
            };
            ws.send(JSON.stringify(message));
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
        const protocol: types.Protocol = JSON.parse(event.data);
        if (protocol.kind === "search result") {
            const hits = protocol.searchResult!.hits;
            if (hits) {
                for (const h of hits.hits) {
                    const log: Log = h._source;
                    try {
                        log.formattedContent = JSON.stringify(JSON.parse(h._source.content), null, "  ");
                    } catch (error) {
                        console.log(error);
                    }
                    app.logsSearchResult.push(log);
                }
                app.logsSearchResultCount = hits.total;
            } else {
                app.logsSearchResultCount = 0;
            }
        } else if (protocol.kind === "flows") {
            for (const flow of protocol.flows!) {
                if (flow.kind === "log") {
                    const log: Log = flow.log;
                    try {
                        log.formattedContent = JSON.stringify(JSON.parse(log.content), null, "  ");
                    } catch (error) {
                        console.log(error);
                    }
                    app.logsPush.unshift(log);
                    app.newLogsCount++;
                } else if (flow.kind === "error") {
                    app.errorsPush.unshift(flow.error);
                    app.newErrorsCount++;
                }
            }

            if (app.logsPush.length > maxCount) {
                trimHistory(app.logsPush);
            }
            if (app.errorsPush.length > maxCount) {
                trimHistory(app.errorsPush);
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
