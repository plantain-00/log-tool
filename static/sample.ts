import { getColor } from "./color";
import * as types from "../src/types";

// declared in config.js
declare const configs: {
    name: string;
    description: string;
    willSum: boolean;
    compute?: (array: { [name: string]: number }) => number;
    unit?: string;
}[];

const chartDatas: LinearChartData[] = [];
let currentAreaIndexMouseOver = -1;
export const charts = [] as {
    title: string,
    id: string,
    unit: string,
    sum: number,
}[];

// initialize charts and charts' datas
for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    charts.push({
        title: `${i + 1}. ${config.description}`,
        id: config.name,
        unit: config.unit ? `(${config.unit})` : "",
        sum: -1,
    });
    chartDatas.push({
        labels: [],
        datasets: [],
    });
}

/**
 * same as array.find
 */
function find<T>(array: T[], condition: (element: T) => boolean): T | undefined {
    for (const element of array) {
        if (condition(element)) {
            return element;
        }
    }
    return undefined;
}

function sum(i: number) {
    if (!configs[i].willSum) {
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
export function trimHistory<T>(array: T[]) {
    if (array.length > maxCount) {
        array.splice(0, array.length - maxCount);
    }
}

function appendChartData(nodeInfo: types.SampleFrame) {
    const time = nodeInfo.time.split(" ")[1]; // "YYYY-MM-DD HH:mm:ss" -> "HH:mm:ss"
    const isOverCount = chartDatas[0].labels!.length >= maxCount;

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        const willTrimHistory = isOverCount && currentAreaIndexMouseOver !== i;
        chartDatas[i].labels!.push(time);
        if (willTrimHistory) {
            trimHistory(chartDatas[i].labels!);
        }

        for (const node of nodeInfo.samples) {
            const nodeName = `${node.hostname}:${node.port}`;
            const count = config.compute ? config.compute(node.values) : node.values[config.name];

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

        charts[i].sum = sum(i);
    }
}

const currentCharts: Chart[] = [];
const currentElements: HTMLCanvasElement[] = [];

// function isElementInViewport(element: HTMLElement) {
//     const rect = element.getBoundingClientRect();
//     return rect.bottom > 0
//         && rect.right > 0
//         && rect.left < (window.innerWidth || document.documentElement.clientWidth)
//         && rect.top < (window.innerHeight || document.documentElement.clientHeight);
// }

export function addNewSamples(time: string, samples: types.Sample[]) {
    appendChartData({
        time,
        samples,
    });

    for (let i = 0; i < configs.length; i++) {
        // const isInViewport = isElementInViewport(currentElements[i]);
        // if (isInViewport && currentAreaIndexMouseOver !== i) {
        currentCharts[i].update();
        // }
    }
}

export function addHistorySamples(historySamples: types.SampleFrame[]) {
    for (const sample of historySamples!) {
        appendChartData(sample);
    }

    for (let i = 0; i < configs.length; i++) {
        const element = document.getElementById("current-" + configs[i].name) as HTMLCanvasElement;
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
            currentAreaIndexMouseOver = i;
        };
        element.onmouseout = () => {
            currentAreaIndexMouseOver = -1;
        };
    }
}
