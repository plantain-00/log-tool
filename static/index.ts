import * as Vue from "vue";
import Component from "vue-class-component";
import * as moment from "moment";
import * as types from "../src/types";
import { Reconnector } from "reconnection/browser";
import { appendChartData, trimHistory, initializeCharts, updateCharts, showSearchResult } from "./sample";
import * as format from "./format";

let ws: WebSocket | undefined;

type Log = types.Log & {
    formattedContent?: string;
    visible?: boolean;
    visibilityButtonExtraBottom?: number;
};
declare const chartConfigs: types.ChartConfig[];

const initialQuery = `time:["1970-01-01 00:00:00" TO *]
AND hostname:*
AND *`;

@Component({
    template: require("raw!./app.html"),
})
class App extends Vue {
    tabIndex = 0;
    logsSearchResult: Log[] = [];
    logsSearchResultCount = 0;
    logsPush: Log[] = [];
    q = initialQuery;
    from = 0;
    size = 10;
    newLogsCount = 0;
    showRawLogResult = false;
    showFormattedLogResult = true;
    showRawLogPush = false;
    showFormattedLogPush = true;
    chartConfigs = chartConfigs;
    chartWidth = 0;
    searchFrom = moment().clone().add(-1, "minute").format("YYYY-MM-DD HH:mm:ss");
    searchTo = moment().format("YYYY-MM-DD HH:mm:ss");
    get leftCount() {
        return this.logsSearchResultCount - this.from - this.size;
    }
    visibilityButtonStyle(log: Log) {
        return {
            position: "absolute",
            bottom: (log.visible ? (10 + log.visibilityButtonExtraBottom) : 0) + "px",
            right: 10 + "px",
        };
    }
    logSearchResultId(index: number) {
        return `log-search-result-${index}`;
    }
    logPushId(index: number) {
        return `log-push-${index}`;
    }
    tab(tabIndex: number) {
        this.tabIndex = tabIndex;
        if (this.tabIndex === 1) {
            this.newLogsCount = 0;
        }
    }
    clearLogsSearchResult() {
        this.logsSearchResult = [];
    }
    clearLogsPush() {
        this.logsPush = [];
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
            ws.send(format.encode(message));
        }
    }
    searchSamples() {
        if (ws) {
            if (!moment(this.searchFrom).isValid()) {
                this.logsPush.unshift({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: `search from is invalid: ${this.searchFrom}`,
                    hostname: "",
                    filepath: "",
                });
                app.newLogsCount++;
                return;
            }
            if (!moment(this.searchTo).isValid()) {
                this.logsPush.unshift({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: `search to is invalid: ${this.searchTo}`,
                    hostname: "",
                    filepath: "",
                });
                app.newLogsCount++;
                return;
            }
            const message: types.Protocol = {
                kind: "search samples",
                searchSamples: {
                    from: this.searchFrom,
                    to: this.searchTo,
                },
            };
            ws.send(format.encode(message));
        }
    }
    resaveFailedLogs() {
        if (ws) {
            const message: types.Protocol = {
                kind: "resave failed logs",
            };
            ws.send(format.encode(message));
        }
    }
    toggleVisibility(log: Log) {
        log.visible = !log.visible;
    }
}

const app = new App({
    el: "#body",
});

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const reconnector = new Reconnector(() => {
    ws = new WebSocket(`${wsProtocol}//${location.host}`);
    ws.binaryType = "arraybuffer";
    ws.onmessage = event => {
        format.decode(event.data, protocol => {
            if (protocol.kind === "search result") {
                if (protocol.searchResult && protocol.searchResult.logs) {
                    for (const h of protocol.searchResult.logs) {
                        const log: Log = h;
                        try {
                            log.visible = true;
                            log.visibilityButtonExtraBottom = 0;
                            log.formattedContent = JSON.stringify(JSON.parse(h.content), null, "  ");
                        } catch (error) {
                            console.log(error);
                        }
                        app.logsSearchResult.push(log);
                    }
                    app.logsSearchResultCount = protocol.searchResult.total;
                } else {
                    app.logsSearchResult = [];
                    app.logsSearchResultCount = 0;
                }
            } else if (protocol.kind === "flows") {
                const samples: types.Sample[] = [];
                if (protocol.flows) {
                    for (const flow of protocol.flows) {
                        if (flow.kind === "log") {
                            const log: Log = flow.log;
                            try {
                                log.visible = true;
                                log.visibilityButtonExtraBottom = 0;
                                log.formattedContent = JSON.stringify(JSON.parse(log.content), null, "  ");
                            } catch (error) {
                                console.log(error);
                            }
                            app.logsPush.unshift(log);
                            app.newLogsCount++;
                        } else if (flow.kind === "sample") {
                            samples.push(flow.sample);
                        }
                    }
                }

                if (samples.length > 0) {
                    appendChartData({
                        time: protocol.serverTime!,
                        samples,
                    });
                }

                trimHistory(app.logsPush);
            } else if (protocol.kind === "history samples") {
                if (protocol.historySamples === undefined) {
                    protocol.historySamples = [];
                }
                initializeCharts();
                for (const sampleFrame of protocol.historySamples) {
                    appendChartData(sampleFrame);
                }
            } else if (protocol.kind === "search samples result") {
                if (protocol.searchSampleResult === undefined) {
                    protocol.searchSampleResult = [];
                }
                showSearchResult(protocol.searchSampleResult);
            }
        });
    };
    ws.onclose = () => {
        reconnector.reconnect();
    };
    ws.onopen = () => {
        reconnector.reset();
    };
});

function handleButtonVisibility(element: HTMLElement | null, log: Log, innerHeight: number) {
    if (element) {
        const rect = element.getBoundingClientRect();
        log.visibilityButtonExtraBottom = (rect.top < innerHeight - 40 && rect.top + rect.height > innerHeight)
            ? (rect.top + rect.height - innerHeight) : 0;
    }
}

window.onscroll = () => {
    const innerHeight = (window.innerHeight || document.documentElement.clientHeight);
    for (let i = 0; i < app.logsSearchResult.length; i++) {
        const log = app.logsSearchResult[i];
        const element = document.getElementById(app.logSearchResultId(i));
        handleButtonVisibility(element, log, innerHeight);
    }
    for (let i = 0; i < app.logsPush.length; i++) {
        const log = app.logsPush[i];
        const element = document.getElementById(app.logPushId(i));
        handleButtonVisibility(element, log, innerHeight);
    }
};

app.chartWidth = document.getElementById("tab-content") !.getBoundingClientRect().width - 30;

setInterval(() => {
    updateCharts();
}, 1000);
