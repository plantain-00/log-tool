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
    charts = [] as VueChart[];
    currentAreaIndexMouseOver = -1;
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

type Source = {
    name: string; // the unique name
    description: string; // the description part
    willSum: boolean; // if true, will sum the value up, or use `compute` to get the value displayed
    compute?: (array: { [name: string]: number }) => number;
    unit?: string; // the unit of the sumed value or computed value
};
type Colors = { [name: string]: string };
type VueChart = {
    title: string,
    id: string,
    unit: string,
    sum: number,
};

const sources: Source[] = [
    { name: "httpAverageResponsesTime", description: "HTTP响应平均耗时", willSum: false, unit: "ms", compute: sample => sample["httpRequestCount"] === 0 ? 0 : Math.round(sample["httpResponseTime"] / sample["httpRequestCount"]) },
    { name: "httpRequestCount", description: "HTTP请求数", willSum: true },
    { name: "httpResponseTime", description: "HTTP响应耗时", willSum: true, unit: "ms" },
];

const chartDatas: LinearChartData[] = [];

for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    app.charts.push({
        title: `${i + 1}. ${source.description}`,
        id: source.name,
        unit: source.unit ? `(${source.unit})` : "",
        sum: -1,
    });
    chartDatas.push({
        labels: [],
        datasets: [],
    });
}
function find<T>(array: T[], condition: (element: T) => boolean): T | undefined {
    for (const element of array) {
        if (condition(element)) {
            return element;
        }
    }
    return undefined;
}
const colors = ["#4BC0C0", "#FFA6B8", "#36A2EB", "#FFCE56", "#979D91", "#A71D1D", "#714096", "#8CCB2A", "#ED8618", "#6B720C"];
const colorsEachNode: Colors = {};
function getColor(nodeName: string) {
    let color = colorsEachNode[nodeName];
    if (color) {
        return color;
    }
    const index = Object.keys(colorsEachNode).length % colors.length;
    colorsEachNode[nodeName] = colors[index];
    return colors[index];
}
function sum(i: number) {
    if (!sources[i].willSum) {
        return -1;
    }
    let result = 0;
    for (const dataset of chartDatas[i].datasets!) {
        for (const data of dataset.data!) {
            result += (data as number);
        }
    }
    return result;
}

const maxCount = 300;
function trimHistory<T>(array: T[]) {
    array.splice(0, array.length - maxCount);
}

function appendChartData(nodeInfo: types.SampleFrame) {
    const time = nodeInfo.time.split(" ")[1]; // "YYYY-MM-DD HH:mm:ss" -> "HH:mm:ss"
    const isOverCount = chartDatas[0].labels!.length >= maxCount;

    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const willTrimHistory = isOverCount && app.currentAreaIndexMouseOver !== i;
        chartDatas[i].labels!.push(time);
        if (willTrimHistory) {
            trimHistory(chartDatas[i].labels!);
        }

        for (const node of nodeInfo.samples) {
            const nodeName = `${node.hostname}:${node.port}`;
            const count = source.compute ? source.compute(node.values) : node.values[source.name];

            const dataset = find(chartDatas[i].datasets!, d => d.label === nodeName);
            if (dataset) {
                (dataset.data as number[]).push(count);
                if (willTrimHistory) {
                    trimHistory(dataset.data as number[]);
                }
            } else {
                let color = getColor(nodeName);

                const length = chartDatas[i].labels!.length - 1;
                const data: number[] = [];
                for (let j = 0; j < length; j++) {
                    data.push(0);
                }
                data.push(count);
                chartDatas[i].datasets!.push({
                    label: nodeName,
                    data,
                    borderColor: color,
                    backgroundColor: color,
                });
            }
        }

        for (const dataset of chartDatas[i].datasets!) {
            const node = find(nodeInfo.samples, n => `${n.hostname}:${n.port}` === dataset.label);
            if (!node) {
                (dataset.data as number[]).push(0);
                trimHistory(dataset.data as number[]);
            }
        }

        app.charts[i].sum = sum(i);
    }
}

const currentCharts: any[] = [];
const currentElements: HTMLCanvasElement[] = [];

// function isElementInViewport(element: HTMLElement) {
//     const rect = element.getBoundingClientRect();
//     return rect.bottom > 0
//         && rect.right > 0
//         && rect.left < (window.innerWidth || document.documentElement.clientWidth)
//         && rect.top < (window.innerHeight || document.documentElement.clientHeight);
// }

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
            const samples: types.Sample[] = [];
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
                } else if (flow.kind === "sample") {
                    samples.push(flow.sample);
                }
            }

            if (samples.length > 0) {
                appendChartData({
                    time: protocol.serverTime!,
                    samples,
                });

                for (let i = 0; i < sources.length; i++) {
                    // const isInViewport = isElementInViewport(currentElements[i]);
                    // if (isInViewport && app.currentAreaIndexMouseOver !== i) {
                    currentCharts[i].update();
                    // }
                }
            }

            if (app.logsPush.length > maxCount) {
                trimHistory(app.logsPush);
            }
            if (app.errorsPush.length > maxCount) {
                trimHistory(app.errorsPush);
            }
        } else if (protocol.kind === "history samples") {
            for (const sample of protocol.historySamples!) {
                appendChartData(sample);
            }

            for (let i = 0; i < sources.length; i++) {
                const element = document.getElementById("current-" + sources[i].name) as HTMLCanvasElement;
                const ctx = element.getContext("2d");
                currentCharts.push(new Chart(ctx!, {
                    type: "line",
                    data: chartDatas[i],
                    options: {
                        responsive: false,
                        animation: {
                            duration: 0,
                        },
                        elements: {
                            line: {
                                borderWidth: 0,
                            },
                            point: {
                                radius: 0,
                            },
                        },
                        scales: {
                            xAxes: [{
                                type: "time",
                                time: {
                                    format: "HH:mm:ss",
                                    tooltipFormat: "HH:mm:ss",
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: "time",
                                },
                            }],
                            yAxes: [{
                                stacked: true,
                                scaleLabel: {
                                    display: true,
                                },
                            }],
                        },
                    },
                }));
                currentElements.push(element);
                element.onmouseover = () => {
                    app.currentAreaIndexMouseOver = i;
                };
                element.onmouseout = () => {
                    app.currentAreaIndexMouseOver = -1;
                };
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
