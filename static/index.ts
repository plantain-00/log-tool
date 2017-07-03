import Vue from "vue";
import Component from "vue-class-component";
import * as moment from "moment";
import * as types from "../src/types";
import { Reconnector } from "reconnection/browser";
import { appendChartData, trimHistory, initializeCharts, updateCharts, showSearchResult } from "./sample";
import * as format from "./format";
import { WsRpc } from "rpc-on-ws";
import { Subject } from "rxjs/Subject";
import { appTemplateHtml, searchLogsTemplateHtml, realtimeLogsTemplateHtml, searchSamplesTemplateHtml, realtimeSamplesTemplateHtml, othersTemplateHtml } from "./variables";
import { TabContainerData } from "tab-container-component/dist/common";

// declared in config.js
declare const chartConfigs: types.ChartConfig[];

let ws: WebSocket | undefined;

type Log = types.Log & {
    formattedContent?: string;
    visible?: boolean;
    visibilityButtonExtraBottom?: number;
    timeValue?: number;
};

const initialQuery = `time:["1970-01-01 00:00:00" TO *]
AND hostname:*
AND *`;

const protocolDataSubject = new Subject<types.Protocol>();
const logsPushSubject = new Subject<Log>();
const updateChartWidthSubject = new Subject<number>();
const scrollSubject = new Subject<number>();
const trimHistorySubject = new Subject<void>();
const updateNewLogsCountSubject = new Subject<void>();

protocolDataSubject.subscribe(protocol => {
    if (protocol.kind === types.ProtocolKind.flows) {
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
                        // tslint:disable-next-line:no-console
                        console.log(error);
                    }
                    logsPushSubject.next(log);
                    updateNewLogsCountSubject.next();
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

        trimHistorySubject.next();
    } else if (protocol.kind === types.ProtocolKind.historySamples) {
        if (protocol.historySamples === undefined) {
            protocol.historySamples = [];
        }
        initializeCharts();
        for (const sampleFrame of protocol.historySamples) {
            appendChartData(sampleFrame);
        }
    }
});

const wsRpc = new WsRpc(protocolDataSubject, message => message.requestId!, message => message.error);

function visibilityButtonStyle(log: Log) {
    return {
        position: "absolute",
        bottom: (log.visible ? (10 + log.visibilityButtonExtraBottom!) : 0) + "px",
        right: 10 + "px",
    };
}

function handleButtonVisibility(element: HTMLElement | null, log: Log, innerHeight: number) {
    if (element) {
        const rect = element.getBoundingClientRect();
        log.visibilityButtonExtraBottom = (rect.top < innerHeight - 40 && rect.top + rect.height > innerHeight)
            ? (rect.top + rect.height - innerHeight) : 0;
    }
}

@Component({
    template: searchLogsTemplateHtml,
    props: ["data"],
})
class SearchLogs extends Vue {
    logsSearchResult: Log[] = [];
    logsSearchResultCount = 0;
    q = initialQuery;
    from = 0;
    size = 10;
    showRawLogResult = false;
    showFormattedLogResult = true;

    get leftCount() {
        return this.logsSearchResultCount - this.from - this.size;
    }

    beforeMount() {
        scrollSubject.subscribe(innerHeight => {
            for (let i = 0; i < this.logsSearchResult.length; i++) {
                const log = this.logsSearchResult[i];
                const element = document.getElementById(this.logSearchResultId(i));
                handleButtonVisibility(element, log, innerHeight);
            }
        });
    }

    beforeDestroy() {
        scrollSubject.unsubscribe();
    }

    visibilityButtonStyle(log: Log) {
        return visibilityButtonStyle(log);
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
            wsRpc.send(requestId => {
                const message: types.Protocol = {
                    kind: types.ProtocolKind.search,
                    requestId,
                    search: {
                        q: this.q,
                        from: this.from,
                        size: this.size,
                    },
                };
                ws!.send(format.encode(message));
            }).then((protocol: types.SearchResultProtocol) => {
                if (protocol.searchResult && protocol.searchResult.logs) {
                    for (const h of protocol.searchResult.logs) {
                        const log: Log = h;
                        log.timeValue = moment(log.time).valueOf();
                        try {
                            log.visible = true;
                            log.visibilityButtonExtraBottom = 0;
                            log.formattedContent = JSON.stringify(JSON.parse(h.content), null, "  ");
                        } catch (error) {
                            // tslint:disable-next-line:no-console
                            console.log(error);
                        }
                        this.logsSearchResult.push(log);
                    }
                    this.logsSearchResultCount = protocol.searchResult.total;
                } else {
                    this.logsSearchResult = [];
                    this.logsSearchResultCount = 0;
                }
            }, (error: Error) => {
                logsPushSubject.next({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: error.message,
                    hostname: "",
                    filepath: "",
                    timeValue: Date.now(),
                });
                updateNewLogsCountSubject.next();
            });
        }
    }

    clearLogsSearchResult() {
        this.logsSearchResult = [];
    }

    logSearchResultId(index: number) {
        return `log-search-result-${index}`;
    }

    toggleVisibility(log: Log) {
        log.visible = !log.visible;
    }
}

Vue.component("search-logs", SearchLogs);

@Component({
    template: realtimeLogsTemplateHtml,
    props: ["data"],
})
class RealtimeLogs extends Vue {
    logsPush: Log[] = [];
    showRawLogPush = false;
    showFormattedLogPush = true;

    beforeMount() {
        logsPushSubject.subscribe(log => {
            this.logsPush.unshift(log);
        });
        scrollSubject.subscribe(innerHeight => {
            for (let i = 0; i < this.logsPush.length; i++) {
                const log = this.logsPush[i];
                const element = document.getElementById(this.logPushId(i));
                handleButtonVisibility(element, log, innerHeight);
            }
        });
        trimHistorySubject.subscribe(() => {
            trimHistory(this.logsPush);
        });
    }

    beforeDestroy() {
        logsPushSubject.unsubscribe();
        scrollSubject.unsubscribe();
        trimHistorySubject.unsubscribe();
    }

    visibilityButtonStyle(log: Log) {
        return visibilityButtonStyle(log);
    }

    clearLogsPush() {
        this.logsPush = [];
    }

    logPushId(index: number) {
        return `log-push-${index}`;
    }

    toggleVisibility(log: Log) {
        log.visible = !log.visible;
    }
}

Vue.component("realtime-logs", RealtimeLogs);

@Component({
    template: searchSamplesTemplateHtml,
    props: ["data"],
})
class SearchSamples extends Vue {
    searchFrom = moment().clone().add(-1, "minute").format("YYYY-MM-DD HH:mm:ss");
    searchTo = moment().format("YYYY-MM-DD HH:mm:ss");
    chartConfigs = chartConfigs;
    chartWidth = 0;

    beforeMount() {
        updateChartWidthSubject.subscribe(chartWidth => {
            this.chartWidth = chartWidth;
        });
    }

    beforeDestroy() {
        updateChartWidthSubject.unsubscribe();
    }

    searchSamples() {
        if (ws) {
            if (!moment(this.searchFrom).isValid()) {
                logsPushSubject.next({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: `search from is invalid: ${this.searchFrom}`,
                    hostname: "",
                    filepath: "",
                    timeValue: Date.now(),
                });
                updateNewLogsCountSubject.next();
                return;
            }
            if (!moment(this.searchTo).isValid()) {
                logsPushSubject.next({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: `search to is invalid: ${this.searchTo}`,
                    hostname: "",
                    filepath: "",
                    timeValue: Date.now(),
                });
                updateNewLogsCountSubject.next();
                return;
            }
            wsRpc.send(requestId => {
                const message: types.Protocol = {
                    kind: types.ProtocolKind.searchSamples,
                    requestId,
                    searchSamples: {
                        from: this.searchFrom,
                        to: this.searchTo,
                    },
                };
                ws!.send(format.encode(message));
            }).then((protocol: types.SearchSampleResultProtocol) => {
                if (protocol.searchSampleResult === undefined) {
                    protocol.searchSampleResult = [];
                }
                showSearchResult(protocol.searchSampleResult);
            }, (error: Error) => {
                logsPushSubject.next({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: error.message,
                    hostname: "",
                    filepath: "",
                    timeValue: Date.now(),
                });
                updateNewLogsCountSubject.next();
            });
        }
    }
}

Vue.component("search-samples", SearchSamples);

@Component({
    template: realtimeSamplesTemplateHtml,
    props: ["data"],
})
class RealtimeSamples extends Vue {
    chartConfigs = chartConfigs;
    chartWidth = 0;

    beforeMount() {
        updateChartWidthSubject.subscribe(chartWidth => {
            this.chartWidth = chartWidth;
        });
    }

    beforeDestroy() {
        updateChartWidthSubject.unsubscribe();
    }
}

Vue.component("realtime-samples", RealtimeSamples);

@Component({
    template: othersTemplateHtml,
    props: ["data"],
})
class Others extends Vue {
    resaveFailedLogs() {
        if (ws) {
            wsRpc.send(requestId => {
                const message: types.Protocol = {
                    kind: types.ProtocolKind.resaveFailedLogs,
                    requestId,
                };
                ws!.send(format.encode(message));
            }).then((protocol: types.ResaveFailedLogsResultProtocol) => {
                logsPushSubject.next({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: `handled ${protocol.resaveFailedLogsResult!.savedCount} / ${protocol.resaveFailedLogsResult!.totalCount} logs.`,
                    hostname: "",
                    filepath: "",
                    timeValue: Date.now(),
                });
                updateNewLogsCountSubject.next();
            }, (error: Error) => {
                logsPushSubject.next({
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    content: error.message,
                    hostname: "",
                    filepath: "",
                    timeValue: Date.now(),
                });
                updateNewLogsCountSubject.next();
            });
        }
    }
}

Vue.component("others", Others);

Vue.component("realtime-logs-title", {
    template: `<a href="javascript:void">Realtime Logs<span class="badge" v-if="data > 0">{{data}}</span></a>`,
    props: ["data"],
});

@Component({
    template: appTemplateHtml,
})
class App extends Vue {
    data: TabContainerData[] = [
        {
            isActive: true,
            title: "Search Logs",
            component: "search-logs",
            data: "",
        },
        {
            isActive: false,
            titleComponent: "realtime-logs-title",
            titleData: 0,
            component: "realtime-logs",
            data: "",
        },
        {
            isActive: false,
            title: "Search Samples",
            component: "search-samples",
            data: "",
        },
        {
            isActive: false,
            title: "Realtime Samples",
            component: "realtime-samples",
            data: "",
        },
        {
            isActive: false,
            title: "Others",
            component: "others",
            data: "",
        },
    ];

    beforeMount() {
        updateNewLogsCountSubject.subscribe(chartWidth => {
            this.data[1].titleData++;
        });
    }

    beforeDestroy() {
        updateNewLogsCountSubject.unsubscribe();
    }

    switching(index: number) {
        if (index === 1) {
            this.data[1].titleData = 0;
        }
    }
}

// tslint:disable-next-line:no-unused-expression
new App({ el: "#body" });

window.onscroll = () => {
    const innerHeight = (window.innerHeight || document.documentElement.clientHeight);
    scrollSubject.next(innerHeight);
};

setTimeout(() => {
    const tabContainerElements = document.getElementsByClassName("tab-container");
    if (tabContainerElements && tabContainerElements.length) {
        updateChartWidthSubject.next(tabContainerElements[0].getBoundingClientRect().width - 30);
    }

    const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
    const reconnector = new Reconnector(() => {
        ws = new WebSocket(`${wsProtocol}//${location.host}/ws`);
        ws.binaryType = "arraybuffer";
        ws.onmessage = event => {
            format.decode(event.data, protocol => {
                protocolDataSubject.next(protocol);
            });
        };
        ws.onclose = () => {
            reconnector.reconnect();
        };
        ws.onopen = () => {
            reconnector.reset();
        };
    });
}, 1000);

setInterval(() => {
    updateCharts();
}, 1000);
