import { ConfigData } from 'file2variable-cli'

export default {
  base: 'static',
  files: [
    'static/*.template.html',
    'static/protocol.proto',
    'static/request-protocol.json',
    'static/response-protocol.json'
  ],
  handler: file => {
    if (file.endsWith('app.template.html')) {
      return { type: 'vue', name: 'App', path: './index' }
    }
    if (file.endsWith('search-logs.template.html')) {
      return { type: 'vue', name: 'SearchLogs', path: './index' }
    }
    if (file.endsWith('realtime-logs.template.html')) {
      return { type: 'vue', name: 'RealtimeLogs', path: './index' }
    }
    if (file.endsWith('search-samples.template.html')) {
      return { type: 'vue', name: 'SearchSamples', path: './index' }
    }
    if (file.endsWith('realtime-samples.template.html')) {
      return { type: 'vue', name: 'RealtimeSamples', path: './index' }
    }
    if (file.endsWith('others.template.html')) {
      return { type: 'vue', name: 'Others', path: './index' }
    }
    if (file.endsWith('.proto')) {
      return { type: 'protobuf' }
    }
    if (file.endsWith('.json')) {
      return { type: 'json' }
    }
    return { type: 'text' }
  },
  out: 'static/variables.ts'
} as ConfigData
