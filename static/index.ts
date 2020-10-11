import { createApp, defineComponent, h, VNode } from 'vue'
import moment from 'moment'

import Reconnector from 'reconnection'
import WsRpc from 'rpc-on-ws'
import { Subject } from 'rxjs'
import { Locale, RelativeTime } from 'relative-time-vue-component'
import {
  appTemplateHtml,
  searchLogsTemplateHtml,
  realtimeLogsTemplateHtml,
  searchSamplesTemplateHtml,
  realtimeSamplesTemplateHtml,
  othersTemplateHtml,
} from './variables'
import { TabContainerData, TabContainer } from 'tab-container-vue-component'

import * as types from '../src/types'
import * as format from './format'
import { appendChartData, trimHistory, initializeCharts, updateCharts, showSearchResult } from './sample'
import { defaultConfig } from './config'

let locale: Locale | null = null

const dateFormat = 'YYYY-MM-DD HH:mm:ss'

let ws: WebSocket | undefined

type Log = types.Log & {
  formattedContent?: string;
  visible?: boolean;
  visibilityButtonExtraBottom?: number;
  timeValue?: number;
}

const initialContent = '*'
const initialTime = `["1970-01-01 00:00:00" TO *]`
const initialHostname = '*'

const protocolDataSubject = new Subject<types.ResponseProtocol>()
const logsPushSubject = new Subject<Log>()
const updateChartWidthSubject = new Subject<number>()
const scrollSubject = new Subject<number>()
const trimHistorySubject = new Subject<void>()
const updateNewLogsCountSubject = new Subject<void>()

protocolDataSubject.subscribe(protocol => {
  if (protocol.kind === types.ProtocolKind.flows) {
    const samples: types.Sample[] = []
    if (protocol.flows && protocol.flows.flows) {
      for (const flow of protocol.flows.flows) {
        if (flow.kind === 'log') {
          const log: Log = flow.log
          log.visible = true
          log.visibilityButtonExtraBottom = 0
          try {
            log.formattedContent = JSON.stringify(JSON.parse(log.content), null, '  ')
          } catch (error: unknown) {
            format.printInConsole(error)
          }
          logsPushSubject.next(log)
          updateNewLogsCountSubject.next()
        } else if (flow.kind === 'sample') {
          samples.push(flow.sample)
        }
      }
    }

    if (samples.length > 0) {
      appendChartData({
        time: protocol.flows.serverTime,
        samples
      })
    }

    trimHistorySubject.next()
  } else if (protocol.kind === types.ProtocolKind.historySamples) {
    if (protocol.historySamples === undefined) {
      protocol.historySamples = []
    }
    initializeCharts()
    for (const sampleFrame of protocol.historySamples) {
      appendChartData(sampleFrame)
    }
  }
})

const wsRpc = new WsRpc<types.ResponseProtocol>(protocolDataSubject, message => {
  if (message.kind === types.ProtocolKind.searchLogsResult) {
    return message.searchLogsResult.requestId
  }
  if (message.kind === types.ProtocolKind.searchSamplesResult) {
    return message.searchSamplesResult.requestId
  }
  if (message.kind === types.ProtocolKind.resaveFailedLogsResult) {
    return message.resaveFailedLogsResult.requestId
  }
  return undefined
}, message => {
  if (message.kind === types.ProtocolKind.searchLogsResult
    && message.searchLogsResult.kind === types.ResultKind.fail) {
    return message.searchLogsResult.error
  }
  if (message.kind === types.ProtocolKind.searchSamplesResult
    && message.searchSamplesResult.kind === types.ResultKind.fail) {
    return message.searchSamplesResult.error
  }
  if (message.kind === types.ProtocolKind.resaveFailedLogsResult
    && message.resaveFailedLogsResult.kind === types.ResultKind.fail) {
    return message.resaveFailedLogsResult.error
  }
  return ''
})

function visibilityButtonStyle(log: Log) {
  return {
    position: 'absolute',
    bottom: (log.visible ? (10 + log.visibilityButtonExtraBottom!) : 0) + 'px',
    right: 10 + 'px'
  }
}

function handleButtonVisibility(element: HTMLElement | null, log: Log, innerHeight: number) {
  if (element) {
    const rect = element.getBoundingClientRect()
    log.visibilityButtonExtraBottom = (rect.top < innerHeight - 40 && rect.top + rect.height > innerHeight)
      ? (rect.top + rect.height - innerHeight) : 0
  }
}

const SearchLogs = defineComponent({
  render: searchLogsTemplateHtml,
  data: () => {
    return {
      logsSearchResult: [] as Log[],
      content: initialContent,
      time: initialTime,
      hostname: initialHostname,
      showRawLogResult: false,
      showFormattedLogResult: true,
      locale,
      logsSearchResultCount: 0,
      from: 0,
      size: 10,
    }
  },
  computed: {
    leftCount(): number {
      return this.logsSearchResultCount - this.from - this.size
    }
  },
  beforeMount() {
    scrollSubject.subscribe(innerHeight => {
      for (let i = 0; i < this.logsSearchResult.length; i++) {
        const log = this.logsSearchResult[i]
        const element = document.getElementById(this.logSearchResultId(i))
        handleButtonVisibility(element, log, innerHeight)
      }
    })
  },
  beforeDestroy() {
    scrollSubject.unsubscribe()
  },
  methods: {
    visibilityButtonStyle(log: Log) {
      return visibilityButtonStyle(log)
    },
    search(freshStart: boolean) {
      if (freshStart) {
        this.from = 0
        this.logsSearchResult = []
        this.logsSearchResultCount = 0
      } else {
        this.from += this.size
      }
      if (ws) {
        wsRpc.send(requestId => {
          const data = format.encodeRequest({
            kind: types.RequestProtocolKind.searchLogs,
            requestId,
            searchLogs: {
              content: this.content,
              time: this.time,
              hostname: this.hostname,
              from: this.from,
              size: this.size
            }
          })
          if (data) {
            ws!.send(data)
          }
        }).then(protocol => {
          if (protocol.kind === types.ProtocolKind.searchLogsResult
            && protocol.searchLogsResult
            && protocol.searchLogsResult.kind === types.ResultKind.success
            && protocol.searchLogsResult.logs) {
            for (const h of protocol.searchLogsResult.logs) {
              const log: Log = h
              log.timeValue = moment(log.time).valueOf()
              log.visible = true
              log.visibilityButtonExtraBottom = 0
              try {
                log.formattedContent = JSON.stringify(JSON.parse(h.content), null, '  ')
              } catch (error: unknown) {
                format.printInConsole(error)
              }
              if (this.content && this.content !== '*') {
                log.content = log.content.split(this.content).join(`<span class="highlighted">${this.content}</span>`)
                if (log.formattedContent) {
                  log.formattedContent = log.formattedContent.split(this.content).join(`<span class="highlighted">${this.content}</span>`)
                }
              }
              this.logsSearchResult.push(log)
            }
            this.logsSearchResultCount = protocol.searchLogsResult.total
          } else {
            this.logsSearchResult = []
            this.logsSearchResultCount = 0
          }
        }, logsPushError)
      }
    },
    clearLogsSearchResult() {
      this.logsSearchResult = []
    },
    logSearchResultId(index: number) {
      return `log-search-result-${index}`
    },
    toggleVisibility(log: Log) {
      log.visible = !log.visible
    }
  }
})

const RealtimeLogs = defineComponent({
  render: realtimeLogsTemplateHtml,
  data: () => {
    return {
      logsPush: [] as Log[],
      showRawLogPush: false,
      showFormattedLogPush: true,
      locale,
    }
  },
  beforeMount() {
    logsPushSubject.subscribe(log => {
      this.logsPush.unshift(log)
    })
    scrollSubject.subscribe(innerHeight => {
      for (let i = 0; i < this.logsPush.length; i++) {
        const log = this.logsPush[i]
        const element = document.getElementById(this.logPushId(i))
        handleButtonVisibility(element, log, innerHeight)
      }
    })
    trimHistorySubject.subscribe(() => {
      trimHistory(this.logsPush)
    })
  },
  beforeDestroy() {
    logsPushSubject.unsubscribe()
    scrollSubject.unsubscribe()
    trimHistorySubject.unsubscribe()
  },
  methods: {
    visibilityButtonStyle(log: Log) {
      return visibilityButtonStyle(log)
    },
    clearLogsPush() {
      this.logsPush = []
    },
    logPushId(index: number) {
      return `log-push-${index}`
    },
    toggleVisibility(log: Log) {
      log.visible = !log.visible
    }
  }
})

const SearchSamples = defineComponent({
  render: searchSamplesTemplateHtml,
  data: () => {
    return {
      searchFrom: moment().clone().add(-1, 'minute').format(dateFormat),
      searchTo: moment().format(dateFormat),
      chartConfigs: defaultConfig.chart,
      chartWidth: 0,
    }
  },
  beforeMount() {
    updateChartWidthSubject.subscribe(chartWidth => {
      this.chartWidth = chartWidth
    })
  },
  beforeDestroy() {
    updateChartWidthSubject.unsubscribe()
  },
  methods: {
    searchSamples() {
      if (ws) {
        if (!moment(this.searchFrom).isValid()) {
          logsPushSubject.next({
            time: moment().format(dateFormat),
            content: `search from is invalid: ${this.searchFrom}`,
            hostname: '',
            filepath: '',
            timeValue: Date.now()
          })
          updateNewLogsCountSubject.next()
          return
        }
        if (!moment(this.searchTo).isValid()) {
          logsPushSubject.next({
            time: moment().format(dateFormat),
            content: `search to is invalid: ${this.searchTo}`,
            hostname: '',
            filepath: '',
            timeValue: Date.now()
          })
          updateNewLogsCountSubject.next()
          return
        }
        wsRpc.send(requestId => {
          ws!.send(format.encodeRequest({
            kind: types.RequestProtocolKind.searchSamples,
            requestId,
            searchSamples: {
              from: this.searchFrom,
              to: this.searchTo
            }
          }) as any)
        }).then(protocol => {
          if (protocol.kind === types.ProtocolKind.searchSamplesResult) {
            if (protocol.searchSamplesResult.kind === types.ResultKind.success) {
              if (protocol.searchSamplesResult.searchSampleResult) {
                showSearchResult(protocol.searchSamplesResult.searchSampleResult)
              } else {
                showSearchResult([])
              }
            } else {
              logsPushSubject.next({
                time: moment().format(dateFormat),
                content: protocol.searchSamplesResult.error,
                hostname: '',
                filepath: '',
                timeValue: Date.now()
              })
              updateNewLogsCountSubject.next()
            }
          }
        }, logsPushError)
      }
    }
  }
})

function logsPushError(error: Error) {
  logsPushSubject.next({
    time: moment().format(dateFormat),
    content: error.message,
    hostname: '',
    filepath: '',
    timeValue: Date.now()
  })
  updateNewLogsCountSubject.next()
}

const RealtimeSamples = defineComponent({
  render: realtimeSamplesTemplateHtml,
  data: () => {
    return {
      chartConfigs: defaultConfig.chart,
      chartWidth: 0
    }
  },
  beforeMount() {
    updateChartWidthSubject.subscribe(chartWidth => {
      this.chartWidth = chartWidth
    })
  },
  beforeDestroy() {
    updateChartWidthSubject.unsubscribe()
  },
  methods: {
    scrollBy(id: string) {
      const element = document.getElementById(`current-${id}`)
      if (element) {
        const rect = element.getBoundingClientRect()
        scrollBy(0, rect.top - 20)
      }
    }
  }
})

const Others = defineComponent({
  render: othersTemplateHtml,
  methods: {
    resaveFailedLogs() {
      if (ws) {
        wsRpc.send(requestId => {
          ws!.send(format.encodeRequest({
            kind: types.RequestProtocolKind.resaveFailedLogs,
            requestId
          }) as any)
        }).then(protocol => {
          if (protocol.kind === types.ProtocolKind.resaveFailedLogsResult) {
            if (protocol.resaveFailedLogsResult.kind === types.ResultKind.success) {
              logsPushSubject.next({
                time: moment().format(dateFormat),
                content: `handled ${protocol.resaveFailedLogsResult.savedCount} / ${protocol.resaveFailedLogsResult.totalCount} logs.`,
                hostname: '',
                filepath: '',
                timeValue: Date.now()
              })
            } else {
              logsPushSubject.next({
                time: moment().format(dateFormat),
                content: protocol.resaveFailedLogsResult.error,
                hostname: '',
                filepath: '',
                timeValue: Date.now()
              })
            }
            updateNewLogsCountSubject.next()
          }
        }, logsPushError)
      }
    }
  }
})

const realtimeLogsTitle = defineComponent({
  render() {
    const children: (VNode | string)[] = ['Realtime Logs']
    if (this.data > 0) {
      children.push(h('span', { class: 'badge' }, [
        this.data.toString()
      ]))
    }
    return h('a', children)
  },
  props: ['data']
})

const App = defineComponent({
  render: appTemplateHtml,
  data: () => {
    return {
      data: [
        {
          isActive: true,
          title: 'Search Logs',
          component: 'search-logs',
          data: ''
        },
        {
          isActive: false,
          titleComponent: 'realtime-logs-title',
          titleData: 0,
          component: 'realtime-logs',
          data: ''
        },
        {
          isActive: false,
          title: 'Search Samples',
          component: 'search-samples',
          data: ''
        },
        {
          isActive: false,
          title: 'Realtime Samples',
          component: 'realtime-samples',
          data: ''
        },
        {
          isActive: false,
          title: 'Others',
          component: 'others',
          data: ''
        }
      ] as TabContainerData[]
    }
  },
  beforeMount() {
    updateNewLogsCountSubject.subscribe(() => {
      this.data[1].titleData++
    })
  },
  beforeDestroy() {
    updateNewLogsCountSubject.unsubscribe()
  },
  methods: {
    switching(index: number) {
      if (index === 1) {
        this.data[1].titleData = 0
      }
    }
  }
})

function start() {
  const app = createApp(App)
  app.component('search-logs', SearchLogs)
  app.component('realtime-logs', RealtimeLogs)
  app.component('search-samples', SearchSamples)
  app.component('realtime-samples', RealtimeSamples)
  app.component('others', Others)
  app.component('realtime-logs-title', realtimeLogsTitle)
  app.component('relative-time', RelativeTime)
  app.component('tab-container', TabContainer)
  app.mount('#body')
}

window.onscroll = () => {
  const innerHeight = (window.innerHeight || document.documentElement!.clientHeight)
  scrollSubject.next(innerHeight)
}

setTimeout(() => {
  const tabContainerElements = document.getElementsByClassName('tab-container')
  if (tabContainerElements && tabContainerElements.length) {
    updateChartWidthSubject.next(tabContainerElements[0].getBoundingClientRect().width - 30)
  }

  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const reconnector = new Reconnector(() => {
    ws = new WebSocket(`${wsProtocol}//${location.host}/ws`)
    ws.binaryType = 'arraybuffer'
    ws.onmessage = event => {
      format.decodeResponse(event.data, protocol => {
        protocolDataSubject.next(protocol)
      })
    }
    ws.onclose = () => {
      reconnector.reconnect()
    }
    ws.onopen = () => {
      reconnector.reset()
    }
  })
}, 1000)

setInterval(() => {
  updateCharts()
}, 1000)

import { locale as zhCNLocale } from 'relative-time-component/dist/locales/zh-CN'

if (navigator.language === 'zh-CN') {
  locale = zhCNLocale
}
start()
