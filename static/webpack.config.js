module.exports = {
  entry: {
    index: './static/index'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js'
  },
  resolve: {
    alias: {
      'moment': 'moment/min/moment.min.js',
      'protobufjs': 'protobufjs/dist/protobuf.min.js'
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  }
}
