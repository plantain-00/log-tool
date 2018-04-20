module.exports = {
  include: [
    'dist/*.js',
    'static/protocol.proto',
    'static/*-protocol.json',
    'log-tool.config.js',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: [
    'cd "[dir]" && yarn --production && node dist/index.js'
  ]
}
