module.exports = {
  inputFiles: [
    'static/vendor.bundle.css',
    'static/index.bundle.css',
    'static/*.bundle-*.js',
    'static/*.*.bundle-*.js',
    'static/index.ejs.html'
  ],
  revisedFiles: [
    'static/*.bundle-*.js',
    'static/*.*.bundle-*.js'
  ],
  outputFiles: file => file.replace('.ejs', ''),
  json: false,
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + '-' + md5String + extensionName,
  base: 'static',
  fileSize: 'static/file-size.json'
}
