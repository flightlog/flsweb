var path = require('path');

var minimist = require('minimist');
var webpack = require('webpack');
var TARGET = minimist(process.argv.slice(2)).TARGET || 'PROD';
const SERVER_URL = minimist(process.argv.slice(2)).SERVER_URL;


var config = {

    context: __dirname + '/src',
    entry: [
        'src/index.js'
    ],

    resolve: {
        root: [path.join(__dirname, "/"), path.join(__dirname, "/node_modules")]
    },

    module: {
        loaders: [
            {test: /.*\.js$/, exclude: /node_modules/, loader: "babel-loader",
                query: {
                    presets: ['es2015']
                }
            },
            {test: /\.css$/, loader: "style!css"},
            {test: /\.json$/, loader: "json"},
            {test: /\.html$/, exclude: /node_modules/, loader: "raw"},
            {test: /\.woff(2)?.*/, loader: "url?limit=10000&minetype=application/font-woff"},
            {test: /\.(ttf|eot|svg).*/, loader: "file"},
            {test: /\.(png|jpg|gif)$/, loader: 'url?limit=8192'}
        ]
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            mangle: false
        })
    ],

    devServer: {
        contentBase: "./src",
        quiet: false,
        noInfo: false,
        stats: {colors: true},
        hot: true,
        port: 3000,
        headers: { "X-Custom-Header": "yes" },
        proxy: {
            "/Token": {
                target: SERVER_URL,
                secure: false
            },
            "/api/*": {
                target: SERVER_URL,
                secure: false
            }
        }
    },

    // support source maps
    devtool: TARGET === "DEV" ? "#cheap-module-eval-source-map" : "none"

};

module.exports = config;