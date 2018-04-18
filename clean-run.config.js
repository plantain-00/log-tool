module.exports = {
  include: [
    'dist/*.js',
    'static/protocol.proto',
    'static/*-protocol.json',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: [
    'cd "[dir]" && yarn --production && node dist/index.js'
  ]
}
