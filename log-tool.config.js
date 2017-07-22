module.exports = function (defaultConfig) {
  defaultConfig.elastic.enabled = false
  defaultConfig.folderSizeWatcher.folders.mysqlSize = './static/'
  defaultConfig.gui.port = 9000
  defaultConfig.watcher.paths = ['./logs/']
  // defaultConfig.protobuf.enabled = false
}
