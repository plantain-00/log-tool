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
    errorsPush: types.ErrorPush[] = [];
    q = "*";
    from = 0;
    size = 10;
    newLogsCount = 0;
    newErrorsCount = 0;
    get leftCount() {
        return this.logsSearchResultCount - this.from - this.size;
    }
    tab(tabIndex: number) {
        this.tabIndex = tabIndex;
        if (this.tabIndex === 1) {
            this.newLogsCount = 0;
        } else if (this.tabIndex === 2) {
            this.newLogsCount = 0;
        }
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
            const message: types.SearchLogsMessage = {
                kind: "search logs",
                q: this.q,
                from: this.from,
                size: this.size,
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
        const message: types.Message = JSON.parse(event.data);
        if (message.kind === "search logs result") {
            for (const h of message.result.hits.hits) {
                const log: Log = h._source;
                try {
                    log.formattedContent = JSON.stringify(JSON.parse(h._source.content), null, "  ");
                } catch (error) {
                    console.log(error);
                }
                app.logsSearchResult.push(log);
            }
            app.logsSearchResultCount = message.result.hits.total;
        } else if (message.kind === "push logs") {
            for (const l of message.logs) {
                const log: Log = l;
                try {
                    log.formattedContent = JSON.stringify(JSON.parse(log.content), null, "  ");
                } catch (error) {
                    console.log(error);
                }
                app.logsPush.unshift(log);
            }
            app.newLogsCount += message.logs.length;
        } else if (message.kind === "push error") {
            for (const error of message.errors) {
                app.errorsPush.unshift(error);
            }
            app.newErrorsCount += message.errors.length;
        }
    };
    ws.onclose = () => {
        reconnector.reconnect();
    };
    ws.onopen = () => {
        reconnector.reset();
    };
});
