import { getColor } from "./color";
import * as types from "../src/types";

// declared in config.js
declare const chartConfigs: types.ChartConfig[];
const chartDatas: { [name: string]: LinearChartData } = {};
const tempChartDatas: { [name: string]: LinearChartData } = {};
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
    tempChartDatas[config.name] = {
        labels: [],
        datasets: [],
    };
}

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

    for (const config of chartConfigs) {
        tempChartDatas[config.name].labels!.push(time);

        for (const sample of sampleFrame.samples) {
            const seriesName = `${sample.hostname}:${sample.port}`;
            const count = config.compute ? config.compute(sample.values) : sample.values[config.name];

            const tempChartDataset = find(tempChartDatas[config.name].datasets!, d => d.label === seriesName);
            if (tempChartDataset) {
                // found it in tempChartDatas, so just push the number to tempChartDatas
                (tempChartDataset.data as number[]).push(count);
            } else {
                // can not find it, create a new series, and push:0,0,0,0...,0,0,count
                const length = chartDatas[config.name].labels!.length + tempChartDatas[config.name].labels!.length - 1;
                const data: number[] = [];
                for (let j = 0; j < length; j++) {
                    data.push(0);
                }
                data.push(count);
                const color = getColor(seriesName);
                tempChartDatas[config.name].datasets!.push({
                    label: seriesName,
                    data,
                    borderColor: color,
                    backgroundColor: color,
                });
            }
        }

        for (const dataset of tempChartDatas[config.name].datasets!) {
            if (sampleFrame.samples.every(s => `${s.hostname}:${s.port}` !== dataset.label)) {
                (dataset.data as number[]).push(0);
            }
        }

        trimHistory(tempChartDatas[config.name].labels!);
        for (const dataset of tempChartDatas[config.name].datasets!) {
            trimHistory(dataset.data as number[]);
        }
    }
}

function isElementInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0
        && rect.right > 0
        && rect.left < (window.innerWidth || document.documentElement.clientWidth)
        && rect.top < (window.innerHeight || document.documentElement.clientHeight);
}

export function updateCharts() {
    for (const config of chartConfigs) {
        const isInViewport = isElementInViewport(allChartElements[config.name]);
        if (isInViewport && mouseOverChartName !== config.name) {
            const hasNewData = tempChartDatas[config.name].labels!.length > 0;
            if (hasNewData) {
                chartDatas[config.name].labels!.push(...tempChartDatas[config.name].labels!);
                tempChartDatas[config.name].labels = [];

                const tempChartDatasets = tempChartDatas[config.name].datasets!;
                for (let index = 0; index < tempChartDatasets.length; index++) {
                    if (index >= chartDatas[config.name].datasets!.length) {
                        chartDatas[config.name].datasets!.push(JSON.parse(JSON.stringify(tempChartDatasets[index])));
                    } else {
                        (chartDatas[config.name].datasets![index].data as number[]).push(...(tempChartDatasets[index].data as number[]));
                    }
                    tempChartDatasets[index].data = [];
                }
            }

            trimHistory(chartDatas[config.name].labels!);
            for (const dataset of chartDatas[config.name].datasets!) {
                trimHistory(dataset.data as number[]);
            }
            calculateSum(config);
            if (hasNewData) {
                allCharts[config.name].update();
            }
        }
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
