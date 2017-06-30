module.exports = {
  inputFiles: [
    'static/vendor.bundle.css',
    'static/index.bundle.css',
    'static/vendor.bundle.js',
    'static/index.bundle.js',
    'static/index.ejs.html'
  ],
  outputFiles: file => file.replace('.ejs', ''),
  json: false,
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + '-' + md5String + extensionName,
  noOutputFiles: []
}
