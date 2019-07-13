const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  entry: {
    index: './static/index'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: isDev ? ['.ts', '.tsx', '.js'] : undefined,
    alias: {
      moment: 'moment/min/moment.min.js',
      protobufjs: 'protobufjs/dist/protobuf.min.js'
    }
  },
  module: isDev ? {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  } : undefined,
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
