module.exports = {
  inputFiles: [
    'static/*.bundle.css',
    'static/*.bundle.js',
    'static/index.ejs.html'
  ],
  revisedFiles: [
  ],
  inlinedFiles: [
    'static/*.bundle.css'
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
