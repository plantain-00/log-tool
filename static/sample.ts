import { getColor } from "./color";
import * as types from "../src/types";

// declared in config.js
declare const chartConfigs: types.ChartConfig[];
const chartDatas: { [name: string]: LinearChartData } = {};
let mouseOverChartName: string | undefined = undefined;
const allCharts: { [name: string]: Chart } = {};
const allChartElements: { [name: string]: HTMLCanvasElement } = {};
const maxCount = 300;

// initialize charts and charts' datas
for (const config of chartConfigs) {
    chartDatas[config.name] = {
        labels: [],
        datasets: [],
    };
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

function calculateSum(config: types.ChartConfig) {
    if (!config.willSum) {
        config.sum = undefined;
    } else {
        let result = 0;
        for (const dataset of chartDatas[config.name].datasets!) {
            for (const data of dataset.data!) {
                result += (data as number);
            }
        }
        config.sum = result;
    }
}

export function trimHistory<T>(array: T[]) {
    if (array.length > maxCount) {
        array.splice(0, array.length - maxCount);
    }
}

export function appendChartData(sampleFrame: types.SampleFrame) {
    const time = sampleFrame.time.split(" ")[1]; // "YYYY-MM-DD HH:mm:ss" -> "HH:mm:ss"
    const isOverCount = chartDatas[chartConfigs[0].name].labels!.length >= maxCount;

    for (const config of chartConfigs) {
        const willTrimHistory = isOverCount && mouseOverChartName !== config.name;
        chartDatas[config.name].labels!.push(time);
        if (willTrimHistory) {
            trimHistory(chartDatas[config.name].labels!);
        }

        for (const sample of sampleFrame.samples) {
            const seriesName = `${sample.hostname}:${sample.port}`;
            const count = config.compute ? config.compute(sample.values) : sample.values[config.name];

            const dataset = find(chartDatas[config.name].datasets!, d => d.label === seriesName);
            if (dataset) {
                (dataset.data as number[]).push(count);
                if (willTrimHistory) {
                    trimHistory(dataset.data as number[]);
                }
            } else {
                let color = getColor(seriesName);

                const length = chartDatas[config.name].labels!.length - 1;
                const data: number[] = [];
                for (let j = 0; j < length; j++) {
                    data.push(0);
                }
                data.push(count);
                chartDatas[config.name].datasets!.push({
                    label: seriesName,
                    data,
                    borderColor: color,
                    backgroundColor: color,
                });
            }
        }

        for (const dataset of chartDatas[config.name].datasets!) {
            const node = find(sampleFrame.samples, sample => `${sample.hostname}:${sample.port}` === dataset.label);
            if (!node) {
                (dataset.data as number[]).push(0);
                trimHistory(dataset.data as number[]);
            }
        }

        calculateSum(config);
    }
}

// function isElementInViewport(element: HTMLElement) {
//     const rect = element.getBoundingClientRect();
//     return rect.bottom > 0
//         && rect.right > 0
//         && rect.left < (window.innerWidth || document.documentElement.clientWidth)
//         && rect.top < (window.innerHeight || document.documentElement.clientHeight);
// }

export function updateCharts() {
    for (const config of chartConfigs) {
        // const isInViewport = isElementInViewport(allChartElements[config.name]);
        // if (isInViewport && mouseOverChartName !== config.name) {
        allCharts[config.name].update();
        // }
    }
}

export function initializeCharts() {
    for (const config of chartConfigs) {
        const element = document.getElementById("current-" + config.name) as HTMLCanvasElement;
        element.onmouseover = () => {
            mouseOverChartName = config.name;
        };
        element.onmouseout = () => {
            mouseOverChartName = undefined;
        };
        allChartElements[config.name] = element;

        const ctx = element.getContext("2d");
        allCharts[config.name] = new Chart(ctx!, {
            type: "line",
            data: chartDatas[config.name],
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
        });
    }
}
