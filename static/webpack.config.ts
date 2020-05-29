import * as webpack from 'webpack'

export default {
  entry: {
    index: './static/index'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      moment: 'moment/min/moment.min.js',
      protobufjs: 'protobufjs/dist/protobuf.min.js'
    }
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
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
} as webpack.Configuration
