const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        index: "./static/index",
        vendor: "./static/vendor"
    },
    output: {
        path: __dirname,
        filename: "[name].bundle.js"
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ["index", "vendor"]
        }),
    ],
    resolve: {
        alias: {
            "vue$": "vue/dist/vue.min.js",
            "moment": "moment/min/moment.min.js",
            "chart.js": "chart.js/dist/Chart.min.js",
            "protobufjs": "protobufjs/dist/protobuf.min.js"
        }
    }
};