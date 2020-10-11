import { Configuration } from 'file2variable-cli'

const config: Configuration = {
  base: 'static',
  files: [
    'static/*.template.html',
    'static/protocol.proto',
    'static/request-protocol.json',
    'static/response-protocol.json'
  ],
  handler: file => {
    if (file.endsWith('.template.html')) {
      return { type: 'vue3' }
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
}

export default config
