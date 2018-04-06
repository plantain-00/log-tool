module.exports = {
  include: [
    'dist/*.js',
    'static/protocol.proto',
    'static/*-protocol.json',
    'static/*.bundle-*.js',
    'static/index.html',
    'LICENSE',
    'package.json',
    'README.md'
  ],
  exclude: [
  ],
  askVersion: true,
  releaseRepository: 'https://github.com/plantain-00/log-tool-release.git'
}
