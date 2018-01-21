import * as libs from './libs'

const defaultConfig = {
  inflow: { // transport logs from another log-tool server.
    enabled: true,
    port: 8001,
    host: 'localhost',
    httpFallbackPath: '/logs' // with this path, you can post logs to http://localhost:8001/logs
  },
  outflow: { // transport logs to another log-tool server.
    enabled: false,
    url: 'ws://localhost:8001'
  },
  watcher: { // watch log directories or files and read logs.
    enabled: true,
    paths: [ // paths of directories or files to be watched.
    ] as string[],
    filePositionsDataPath: './log-tool.watcher.data', // path of the file that stores the status of the watched files.
    parseLine: (line: string, moment: typeof libs.moment, filepath: string) => { // parse a line of log string to get time and other valid information.
      return {
        skip: false, // if true, just skip this line of log
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        content: line // the string that not include time, better be a json string
      }
    }
  },
  gui: { // push new logs to a web page, for monitor purpose.
    enabled: true,
    port: 8000,
    host: 'localhost'
  },
  elastic: { // transport logs to elastic search server for searching old logs purpose.
    enabled: true,
    // `tool` is the index name, `logs` is the type name, they are all needed.
    url: 'http://localhost:9200/tool/logs'
  },
  protobuf: { // transport data by protobuf binary, rather than json string.
    enabled: true
  },
  folderSizeWatcher: { // watch the size of folder.
    enabled: true,
    folders: {} as { [name: string]: string }
  },
  countLogs: { // count the logs.
    enabled: true
  },
  os: { // show os information.
    enabled: true
  },
  sqlite: {
    filePath: './data.db',
    samples: true // if enabled, will save samples to sqlite.
  }
}

const configurationFilePath = process.argv[2] || '../log-tool.config.js'
require(configurationFilePath)(defaultConfig)

export = defaultConfig
