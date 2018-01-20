import * as libs from './libs'
import * as watcher from './watcher'
import * as gui from './gui'
import * as inflow from './inflow'
import * as outflow from './outflow'
import * as elastic from './elastic'
import * as format from './format'
import * as sqlite from './sqlite'
import * as folderSizeWatcher from './folder-size-watcher'
import * as countLogs from './count-logs'
import * as os from './os'

watcher.start()
gui.start()
inflow.start()
outflow.start()
elastic.start()
format.start()
sqlite.start()
folderSizeWatcher.start()
countLogs.start()
os.start()

libs.printInConsole('log tool started.')

libs.logSubject.subscribe(log => {
  libs.printInConsole(log)
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
