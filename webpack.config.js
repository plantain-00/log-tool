const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        index: "./static/index",
        vendor: "./static/vendor"
    },
    output: {
        path: path.join(__dirname, "static"),
        filename: "[name].bundle.js"
    },
    externals: {
        "vue": "Vue"
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
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
            "vue$": "vue/dist/vue.js",
            "markdown-it": "markdown-it/dist/markdown-it.min.js"
        }
    }
};
