import Chart, { ChartDataSets } from 'chart.js'

import { getColor } from './color'
import * as types from '../src/types'
import { defaultConfig, ChartConfig } from './config'

const chartDatas: { [name: string]: Chart.ChartData } = {}
const tempChartDatas: { [name: string]: Chart.ChartData } = {}
let mouseOverChartName: string | undefined
const allCharts: { [name: string]: Chart } = {}
const allChartElements: { [name: string]: HTMLCanvasElement } = {}
const maxCount = 300

const searchResultChartDatas: { [name: string]: Chart.ChartData } = {}
const searchResultCharts: { [name: string]: Chart } = {}

// initialize charts and charts' datas
for (const config of defaultConfig.chart) {
  chartDatas[config.name] = {
    labels: [],
    datasets: []
  }
  tempChartDatas[config.name] = {
    labels: [],
    datasets: []
  }
  searchResultChartDatas[config.name] = {
    labels: [],
    datasets: []
  }
}

function find<T>(array: readonly T[], condition: (element: T) => boolean): T | undefined {
  for (const element of array) {
    if (condition(element)) {
      return element
    }
  }
  return undefined
}

export function trimHistory<T>(array: T[]) {
  if (array.length > maxCount) {
    array.splice(0, array.length - maxCount)
  }
}

function getSampleName(sample: types.Sample) {
  return sample.port !== undefined ? `${sample.hostname}:${sample.port}` : sample.hostname
}

function getValue(config: ChartConfig, sample: types.Sample) {
  const count = config.compute ? config.compute(sample.values) : sample.values[config.name]
  return config.unitScale === undefined ? count : Math.round(count / config.unitScale)
}

export function appendChartData(sampleFrame: types.SampleFrame) {
  const time = sampleFrame.time // .split(" ")[1]; // "YYYY-MM-DD HH:mm:ss" -> "HH:mm:ss"

  for (const config of defaultConfig.chart) {
    (tempChartDatas[config.name].labels as string[]).push(time)

    if (sampleFrame.samples) {
      for (const sample of sampleFrame.samples) {
        const seriesName = getSampleName(sample)
        const count = getValue(config, sample)

        const tempChartDataset = find(tempChartDatas[config.name].datasets!, d => d.label === seriesName)
        if (tempChartDataset) {
          // found it in tempChartDatas, so just push the number to tempChartDatas
          (tempChartDataset.data as number[]).push(count)
        } else {
          // can not find it, create a new series, and push:0,0,0,0...,0,0,count
          const length = chartDatas[config.name].labels!.length + tempChartDatas[config.name].labels!.length - 1
          const data: number[] = []
          for (let j = 0; j < length; j++) {
            data.push(0)
          }
          data.push(count)
          const color = getColor(seriesName);
          (tempChartDatas[config.name].datasets as ChartDataSets[]).push({
            label: seriesName,
            data,
            borderColor: color,
            backgroundColor: color
          })
        }
      }

      for (const dataset of tempChartDatas[config.name].datasets!) {
        if (sampleFrame.samples.every(s => getSampleName(s) !== dataset.label)) {
          (dataset.data as number[]).push(0)
        }
      }
    }

    trimHistory(tempChartDatas[config.name].labels as string[])
    for (const dataset of tempChartDatas[config.name].datasets!) {
      trimHistory(dataset.data as number[])
    }
  }
}

function isElementInViewport(element: HTMLElement) {
  if (element) {
    const rect = element.getBoundingClientRect()
    return rect.bottom > 0
      && rect.right > 0
      && rect.left < (window.innerWidth || document.documentElement!.clientWidth)
      && rect.top < (window.innerHeight || document.documentElement!.clientHeight)
  }
  return false
}

export function updateCharts() {
  for (const config of defaultConfig.chart) {
    const isInViewport = isElementInViewport(allChartElements[config.name])
    if (isInViewport && mouseOverChartName !== config.name) {
      const hasNewData = tempChartDatas[config.name].labels!.length > 0
      if (hasNewData) {
        (chartDatas[config.name].labels as string[]).push(...tempChartDatas[config.name].labels as string[])
        tempChartDatas[config.name].labels = []

        const tempChartDatasets = tempChartDatas[config.name].datasets!
        for (let index = 0; index < tempChartDatasets.length; index++) {
          if (index >= chartDatas[config.name].datasets!.length) {
            (chartDatas[config.name].datasets as ChartDataSets[]).push(JSON.parse(JSON.stringify(tempChartDatasets[index])))
          } else {
            (chartDatas[config.name].datasets![index].data as number[]).push(...(tempChartDatasets[index].data as number[]))
          }
          tempChartDatasets[index].data = []
        }
      }

      trimHistory(chartDatas[config.name].labels as string[])
      for (const dataset of chartDatas[config.name].datasets!) {
        trimHistory(dataset.data as number[])
      }
      if (hasNewData) {
        allCharts[config.name].update()
      }
    }
  }
}

export function initializeCharts() {
  for (const config of defaultConfig.chart) {
    const element = document.getElementById('current-' + config.name) as HTMLCanvasElement
    element.onmouseover = () => {
      mouseOverChartName = config.name
    }
    element.onmouseout = () => {
      mouseOverChartName = undefined
    }
    allChartElements[config.name] = element

    const ctx = element.getContext('2d')
    allCharts[config.name] = new Chart(ctx!, {
      type: 'line',
      data: chartDatas[config.name],
      options: {
        responsive: false,
        animation: {
          duration: 0
        },
        elements: {
          line: {
            borderWidth: 0
          },
          point: {
            radius: 0
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              // format: "HH:mm:ss",
              tooltipFormat: 'HH:mm:ss'
            },
            scaleLabel: {
              display: true,
              labelString: 'time'
            }
          }],
          yAxes: [{
            stacked: true,
            scaleLabel: {
              display: true
            }
          }]
        }
      }
    })
  }

  for (const config of defaultConfig.chart) {
    const element = document.getElementById('history-' + config.name) as HTMLCanvasElement
    const ctx = element.getContext('2d')
    searchResultCharts[config.name] = new Chart(ctx!, {
      type: 'line',
      data: searchResultChartDatas[config.name],
      options: {
        responsive: false,
        animation: {
          duration: 0
        },
        elements: {
          line: {
            borderWidth: 0
          },
          point: {
            radius: 0
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              // format: "YYYY-MM-DD HH:mm:ss",
              tooltipFormat: 'YYYY-MM-DD HH:mm:ss'
            },
            scaleLabel: {
              display: true,
              labelString: 'time'
            }
          }],
          yAxes: [{
            stacked: true,
            scaleLabel: {
              display: true
            }
          }]
        }
      }
    })
  }
}

export function showSearchResult(sampleFrames: types.SampleFrame[]) {
  for (const config of defaultConfig.chart) {
    searchResultChartDatas[config.name].labels = []
    searchResultChartDatas[config.name].datasets = []
  }

  for (const sampleFrame of sampleFrames) {
    for (const config of defaultConfig.chart) {
      (searchResultChartDatas[config.name].labels as string[]).push(sampleFrame.time)

      if (sampleFrame.samples) {
        for (const sample of sampleFrame.samples) {
          const seriesName = getSampleName(sample)
          const count = getValue(config, sample)

          const searchResultChartDataset = find(searchResultChartDatas[config.name].datasets!, d => d.label === seriesName)
          if (searchResultChartDataset) {
            // found it in searchResultChartDatas, so just push the number to searchResultChartDatas
            (searchResultChartDataset.data as number[]).push(count)
          } else {
            // can not find it, create a new series, and push:0,0,0,0...,0,0,count
            const length = searchResultChartDatas[config.name].labels!.length - 1
            const data: number[] = []
            for (let j = 0; j < length; j++) {
              data.push(0)
            }
            data.push(count)
            const color = getColor(seriesName);
            (searchResultChartDatas[config.name].datasets as ChartDataSets[]).push({
              label: seriesName,
              data,
              borderColor: color,
              backgroundColor: color
            })
          }
        }

        for (const dataset of searchResultChartDatas[config.name].datasets!) {
          if (sampleFrame.samples.every(s => getSampleName(s) !== dataset.label)) {
            (dataset.data as number[]).push(0)
          }
        }
      }
    }
  }
  for (const config of defaultConfig.chart) {
    searchResultCharts[config.name].update()
  }
}
