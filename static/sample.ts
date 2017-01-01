import { getColor } from "./color";
import * as types from "../src/types";

type Config = {
    name: string;
    description: string;
    willSum: boolean;
    compute?: (array: { [name: string]: number }) => number;
    unit?: string;
};

// declared in config.js
declare const configs: Config[];

const chartDatas: { [name: string]: LinearChartData } = {};
let mouseOverChartName: string | undefined = undefined;
export const charts = [] as {
    title: string,
    id: string,
    unit: string,
    sum: number,
}[];
const allCharts: { [name: string]: Chart } = {};
const allChartElements: { [name: string]: HTMLCanvasElement } = {};
const maxCount = 300;

// initialize charts and charts' datas
for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    charts.push({
        title: `${i + 1}. ${config.description}`,
        id: config.name,
        unit: config.unit ? `(${config.unit})` : "",
        sum: -1,
    });
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

function sum(config: Config) {
    if (!config.willSum) {
        return -1;
    }
    let result = 0;
    for (const dataset of chartDatas[config.name].datasets!) {
        for (const data of dataset.data!) {
            result += (data as number);
        }
    }
    return result;
}

export function trimHistory<T>(array: T[]) {
    if (array.length > maxCount) {
        array.splice(0, array.length - maxCount);
    }
}

function appendChartData(sampleFrame: types.SampleFrame) {
    const time = sampleFrame.time.split(" ")[1]; // "YYYY-MM-DD HH:mm:ss" -> "HH:mm:ss"
    const isOverCount = chartDatas[configs[0].name].labels!.length >= maxCount;

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
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

        charts[i].sum = sum(config);
    }
}

// function isElementInViewport(element: HTMLElement) {
//     const rect = element.getBoundingClientRect();
//     return rect.bottom > 0
//         && rect.right > 0
//         && rect.left < (window.innerWidth || document.documentElement.clientWidth)
//         && rect.top < (window.innerHeight || document.documentElement.clientHeight);
// }

export function addNewSamples(sampleFrame: types.SampleFrame) {
    appendChartData(sampleFrame);

    for (const config of configs) {
        // const isInViewport = isElementInViewport(allChartElements[config.name]);
        // if (isInViewport && mouseOverChartName !== config.name) {
        allCharts[config.name].update();
        // }
    }
}

export function addHistorySamples(historySampleFrames: types.SampleFrame[]) {
    for (const sampleFrame of historySampleFrames!) {
        appendChartData(sampleFrame);
    }

    for (const config of configs) {
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
