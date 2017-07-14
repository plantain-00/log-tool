module.exports = {
  include: [
    'dist/*.js',
    'static/protocol.proto',
    'static/protocol.json',
    'static/*.bundle-*.js',
    'static/index.html',
    'static/index.config.js',
    'log-tool.config.js',
    'LICENSE',
    'package.json',
    'README.md'
  ],
  exclude: [
  ],
  releaseRepository: 'https://github.com/plantain-00/log-tool-release.git'
}
